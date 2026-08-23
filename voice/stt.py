"""Speech-to-Text providers.

Every provider implements :class:`BaseSTT`, so swapping engines is a one-line
config change (``STT_PROVIDER``) rather than a code change. Models load lazily
on first transcription so importing this module stays cheap.

Providers
---------
sravaani        SraVaani-1.0 (ARTPARK-IISc) — 65 Indic languages + English,
                FastConformer/TDT-CTC, non-autoregressive, auto language-ID.
faster_whisper  Whisper via CTranslate2 — strong English, weak Indic.
mock            No model. Fixed transcript for wiring up the UI.
"""
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional

import audio_utils
import config


@dataclass
class STTResult:
    """Normalised transcription output shared by all providers."""

    text: str
    language: Optional[str] = None
    provider: str = ""
    latency_ms: float = 0.0
    audio_seconds: Optional[float] = None
    meta: Dict[str, Any] = field(default_factory=dict)

    @property
    def rtf(self) -> Optional[float]:
        """Real-time factor: processing time / audio duration. Lower is better."""
        if not self.audio_seconds:
            return None
        return round((self.latency_ms / 1000.0) / self.audio_seconds, 3)


class BaseSTT:
    """Interface every STT engine must satisfy."""

    name: str = "base"

    def load(self) -> None:
        """Loads the model into memory. Safe to call repeatedly."""
        raise NotImplementedError

    def transcribe(self, wav_path: Path, language: Optional[str] = None) -> STTResult:
        """Transcribes 16 kHz mono PCM wav at ``wav_path``."""
        raise NotImplementedError

    def warmup(self) -> None:
        """Loads the model and runs one throwaway inference.

        Measured on CPU, the first transcription runs ~4x slower than steady
        state (RTF 0.44 vs 0.10), so pay that cost at startup instead of on a
        user's first request.
        """
        self.load()
        silence = None
        try:
            silence = audio_utils.make_silence_wav(1.0)
            self.transcribe(silence)
        finally:
            audio_utils.cleanup(silence)

    @property
    def is_loaded(self) -> bool:
        return getattr(self, "_model", None) is not None


class SraVaaniSTT(BaseSTT):
    """SraVaani-1.0 — the primary engine for Indian-language coverage.

    The Hugging Face repo is gated: accept the licence on the model page, then
    authenticate either via ``hf auth login`` (cached globally) or by setting
    ``HF_TOKEN``.
    """

    name = "sravaani"

    def __init__(self) -> None:
        self._model = None
        self._device = config.resolve_device()

    def load(self) -> None:
        if self._model is not None:
            return

        try:
            from transformers import AutoModel
        except ImportError as exc:
            raise RuntimeError(
                "transformers is not installed. Run: pip install -r voice/requirements.txt"
            ) from exc

        # A token is optional: `hf auth login` caches credentials globally and
        # transformers picks them up. Only pass one when explicitly configured.
        kwargs: Dict[str, Any] = {"trust_remote_code": True}
        if config.HF_TOKEN:
            kwargs["token"] = config.HF_TOKEN

        try:
            self._model = (
                AutoModel.from_pretrained(config.SRAVAANI_REPO, **kwargs)
                .to(self._device)
                .eval()
            )
        except Exception as exc:
            raise RuntimeError(
                f"Could not load {config.SRAVAANI_REPO}. It is a gated model — "
                "accept the licence on its Hugging Face page, then either run "
                "`hf auth login` or set HF_TOKEN in voice/.env.\n"
                f"Original error: {exc}"
            ) from exc

    def transcribe(self, wav_path: Path, language: Optional[str] = None) -> STTResult:
        self.load()
        import torch

        started = time.perf_counter()
        # transcribe() takes a *list* of paths and returns one hypothesis each.
        # SraVaani runs its own language identification, so `language` is
        # accepted for interface parity but never forwarded.
        with torch.inference_mode():
            hyps = self._model.transcribe([str(wav_path)], return_hypotheses=True)
        elapsed_ms = (time.perf_counter() - started) * 1000

        hyp = _first_hypothesis(hyps)
        return STTResult(
            text=_hypothesis_text(hyp),
            # The hypothesis exposes text/score/timestamp/y_sequence only — the
            # detected language is not retrievable, so echo the caller's hint.
            language=language,
            provider=self.name,
            latency_ms=round(elapsed_ms, 1),
            audio_seconds=audio_utils.wav_duration_seconds(wav_path),
            meta={
                "device": self._device,
                "repo": config.SRAVAANI_REPO,
                "score": _hypothesis_attr(hyp, "score"),
            },
        )


class FasterWhisperSTT(BaseSTT):
    """faster-whisper — English fast path and comparison baseline."""

    name = "faster_whisper"

    def __init__(self) -> None:
        self._model = None
        self._device = config.resolve_device()

    def load(self) -> None:
        if self._model is not None:
            return

        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise RuntimeError(
                "faster-whisper is not installed. Run: pip install faster-whisper"
            ) from exc

        compute_type = config.WHISPER_COMPUTE_TYPE
        if self._device == "cpu" and compute_type == "float16":
            compute_type = "int8"  # float16 is not supported on CPU

        self._model = WhisperModel(
            config.WHISPER_MODEL_SIZE,
            device=self._device,
            compute_type=compute_type,
        )

    def transcribe(self, wav_path: Path, language: Optional[str] = None) -> STTResult:
        self.load()
        started = time.perf_counter()
        segments, info = self._model.transcribe(
            str(wav_path),
            language=language,
            vad_filter=True,  # suppresses Whisper's hallucination-on-silence
            beam_size=1,      # greedy: lowest latency
        )
        text = "".join(segment.text for segment in segments).strip()
        elapsed_ms = (time.perf_counter() - started) * 1000

        return STTResult(
            text=text,
            language=getattr(info, "language", None) or language,
            provider=self.name,
            latency_ms=round(elapsed_ms, 1),
            audio_seconds=getattr(info, "duration", None)
            or audio_utils.wav_duration_seconds(wav_path),
            meta={
                "device": self._device,
                "model_size": config.WHISPER_MODEL_SIZE,
                "language_probability": round(
                    getattr(info, "language_probability", 0.0) or 0.0, 3
                ),
            },
        )


_PROVIDERS = {
    "sravaani": SraVaaniSTT,
    "faster_whisper": FasterWhisperSTT,
}

_cache: Dict[str, BaseSTT] = {}


def get_stt(provider: Optional[str] = None) -> BaseSTT:
    """Returns a cached STT provider instance."""
    key = (provider or config.STT_PROVIDER).strip().lower()
    if key not in _PROVIDERS:
        raise ValueError(
            f"Unknown STT provider '{key}'. Available: {', '.join(_PROVIDERS)}"
        )
    if key not in _cache:
        _cache[key] = _PROVIDERS[key]()
    return _cache[key]


def available_providers() -> Dict[str, bool]:
    """Maps each provider name to whether its model is currently in memory."""
    return {name: _cache[name].is_loaded if name in _cache else False for name in _PROVIDERS}


# -----------------------------------------------------------------------------
# Hypothesis unwrapping
# -----------------------------------------------------------------------------
# SraVaani returns a list of hypothesis objects exposing .text / .score /
# .timestamp / .y_sequence. These helpers stay defensive so a model update does
# not take the pipeline down.

def _first_hypothesis(hyps: Any) -> Any:
    if isinstance(hyps, (list, tuple)):
        return hyps[0] if hyps else None
    return hyps


def _hypothesis_text(hyp: Any) -> str:
    if hyp is None:
        return ""
    if isinstance(hyp, str):
        return hyp.strip()
    return str(getattr(hyp, "text", "") or "").strip()


def _hypothesis_attr(hyp: Any, attr: str) -> Optional[Any]:
    value = getattr(hyp, attr, None) if hyp is not None else None
    if value is None:
        return None
    return round(float(value), 3) if isinstance(value, (int, float)) else str(value)
