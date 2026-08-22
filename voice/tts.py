"""Text-to-Speech providers.

Mirrors the structure of :mod:`stt` — every provider implements :class:`BaseTTS`
so engines swap via the ``TTS_PROVIDER`` config value rather than a code change.
Models load lazily on first synthesis.

Providers
---------
kokoro  Kokoro-82M (hexgrad) — Apache 2.0, 82M params, English + Hindi.
        Measured RTF ~0.45 on 4 CPU threads. Primary engine.
piper   Piper VITS ONNX voices — MIT weights, wider Indic coverage
        (hi/bn/mr/te/ml/ne/ur). Optional; requires voice files in voice/models/.
mock    Emits silence. Lets the UI be wired without loading any model.
"""
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

import audio_utils
import config


@dataclass
class TTSResult:
    """Normalised synthesis output shared by all providers."""

    audio_path: Path
    sample_rate: int
    provider: str = ""
    voice: str = ""
    language: str = "en"
    latency_ms: float = 0.0
    audio_seconds: Optional[float] = None
    meta: Dict[str, Any] = field(default_factory=dict)

    @property
    def rtf(self) -> Optional[float]:
        """Real-time factor: synthesis time / audio produced. Lower is better."""
        if not self.audio_seconds:
            return None
        return round((self.latency_ms / 1000.0) / self.audio_seconds, 3)

    def to_base64(self) -> str:
        return audio_utils.wav_to_base64(self.audio_path)


class BaseTTS:
    """Interface every TTS engine must satisfy."""

    name: str = "base"

    def load(self) -> None:
        """Loads the model into memory. Safe to call repeatedly."""
        raise NotImplementedError

    def synthesize(
        self, text: str, language: str = "en", voice: Optional[str] = None
    ) -> TTSResult:
        """Renders ``text`` to a wav file and returns its path plus timings."""
        raise NotImplementedError

    def warmup(self) -> None:
        """Loads the model and synthesises one throwaway phrase.

        Measured on CPU, Kokoro's first call costs ~32s (spaCy model fetch and
        graph warmup) against ~4s steady state. Pay that at startup.
        """
        self.load()
        result = None
        try:
            try:
                result = self.synthesize("नमस्ते", language="hi")
            except Exception:
                result = self.synthesize("Hello", language="en")
        finally:
            if result is not None:
                audio_utils.cleanup(result.audio_path)

    @property
    def is_loaded(self) -> bool:
        return bool(getattr(self, "_loaded", False))


class KokoroTTS(BaseTTS):
    """Kokoro-82M — the primary engine.

    Kokoro keys languages by a single-character ``lang_code`` and pairs each
    with voices whose names carry the same prefix (``af_*``/``am_*`` American
    English, ``bf_*``/``bm_*`` British, ``hf_*``/``hm_*`` Hindi). One KPipeline
    is cached per language because each loads its own G2P backend.
    """

    name = "kokoro"

    # ISO language hint -> Kokoro lang_code
    LANG_CODES = {
        "en": "a",
        "en-us": "a",
        "en-gb": "b",
        "hi": "h",
    }

    def __init__(self) -> None:
        self._pipelines: Dict[str, Any] = {}
        self._loaded = False

    def _default_voice(self, lang_code: str) -> str:
        return {
            "a": config.KOKORO_VOICE_EN,
            "b": config.KOKORO_VOICE_EN_GB,
            "h": config.KOKORO_VOICE_HI,
        }.get(lang_code, config.KOKORO_VOICE_EN)

    def _pipeline(self, lang_code: str):
        if lang_code not in self._pipelines:
            try:
                from kokoro import KPipeline
            except ImportError as exc:
                raise RuntimeError(
                    "kokoro is not installed. It requires Python 3.10-3.12; "
                    "install into voice/.venv with: "
                    "pip install -r voice/requirements.txt"
                ) from exc
            # repo_id is passed explicitly; Kokoro warns when it has to default it.
            self._pipelines[lang_code] = KPipeline(
                lang_code=lang_code, repo_id=config.KOKORO_REPO
            )
            self._loaded = True
        return self._pipelines[lang_code]

    def load(self) -> None:
        # Load the two languages the assistant actually replies in.
        self._pipeline("a")
        self._pipeline("h")

    def synthesize(
        self, text: str, language: str = "en", voice: Optional[str] = None
    ) -> TTSResult:
        text = (text or "").strip()
        if not text:
            raise ValueError("Cannot synthesise empty text.")

        import numpy as np
        import soundfile as sf

        lang_code = self.LANG_CODES.get(language.lower(), "a")
        voice = voice or self._default_voice(lang_code)
        pipeline = self._pipeline(lang_code)

        started = time.perf_counter()
        chunks: List[Any] = [audio for _, _, audio in pipeline(text, voice=voice)]
        if not chunks:
            raise RuntimeError(f"Kokoro produced no audio for language '{language}'.")
        samples = np.concatenate(chunks)
        elapsed_ms = (time.perf_counter() - started) * 1000

        dst = audio_utils._temp_path(".wav")
        sf.write(str(dst), samples, config.KOKORO_SAMPLE_RATE)

        return TTSResult(
            audio_path=dst,
            sample_rate=config.KOKORO_SAMPLE_RATE,
            provider=self.name,
            voice=voice,
            language=language,
            latency_ms=round(elapsed_ms, 1),
            audio_seconds=round(len(samples) / config.KOKORO_SAMPLE_RATE, 3),
            meta={"lang_code": lang_code, "chunks": len(chunks)},
        )


class PiperTTS(BaseTTS):
    """Piper VITS voices — optional, for Indic languages Kokoro cannot speak.

    Voice models are ``.onnx`` + ``.onnx.json`` pairs downloaded from
    ``rhasspy/piper-voices`` (MIT) into ``voice/models/``. Unlike Kokoro this
    path is not yet benchmarked here — treat its latency as unverified.
    """

    name = "piper"

    # Voice names verified against the rhasspy/piper-voices file listing.
    LANG_VOICES = {
        "en": "en_US-lessac-medium",
        "hi": "hi_IN-pratham-medium",
        "bn": "bn_BD-google-medium",
        "mr": "mr_IN-google-medium",
        "te": "te_IN-venkatesh-medium",
        "ml": "ml_IN-arjun-medium",
        "ne": "ne_NP-google-medium",
    }

    def __init__(self) -> None:
        self._voices: Dict[str, Any] = {}
        self._loaded = False

    def _voice(self, voice_name: str):
        if voice_name not in self._voices:
            try:
                from piper import PiperVoice
            except ImportError as exc:
                raise RuntimeError(
                    "piper-tts is not installed. Run: pip install piper-tts"
                ) from exc

            model_path = config.MODELS_DIR / f"{voice_name}.onnx"
            if not model_path.exists():
                raise RuntimeError(
                    f"Piper voice '{voice_name}' not found at {model_path}.\n"
                    "Download the .onnx and .onnx.json pair from "
                    "https://huggingface.co/rhasspy/piper-voices into voice/models/."
                )
            self._voices[voice_name] = PiperVoice.load(str(model_path))
            self._loaded = True
        return self._voices[voice_name]

    def load(self) -> None:
        self._voice(self.LANG_VOICES["en"])

    def synthesize(
        self, text: str, language: str = "en", voice: Optional[str] = None
    ) -> TTSResult:
        text = (text or "").strip()
        if not text:
            raise ValueError("Cannot synthesise empty text.")

        import wave

        voice_name = voice or self.LANG_VOICES.get(language.lower(), self.LANG_VOICES["en"])
        piper_voice = self._voice(voice_name)
        dst = audio_utils._temp_path(".wav")

        started = time.perf_counter()
        with wave.open(str(dst), "wb") as wav_file:
            # synthesize_wav is the current entrypoint; older builds expose
            # synthesize(). Support both so a piper upgrade does not break us.
            synth = getattr(piper_voice, "synthesize_wav", None) or piper_voice.synthesize
            synth(text, wav_file)
        elapsed_ms = (time.perf_counter() - started) * 1000

        return TTSResult(
            audio_path=dst,
            sample_rate=config.PIPER_SAMPLE_RATE,
            provider=self.name,
            voice=voice_name,
            language=language,
            latency_ms=round(elapsed_ms, 1),
            audio_seconds=audio_utils.wav_duration_seconds(dst),
            meta={"model": voice_name},
        )


class MockTTS(BaseTTS):
    """Emits one second of silence so the UI can be wired without a model."""

    name = "mock"

    def __init__(self) -> None:
        self._loaded = True

    def load(self) -> None:
        return

    def warmup(self) -> None:
        return

    def synthesize(
        self, text: str, language: str = "en", voice: Optional[str] = None
    ) -> TTSResult:
        dst = audio_utils.make_silence_wav(1.0)
        return TTSResult(
            audio_path=dst,
            sample_rate=config.TARGET_SAMPLE_RATE,
            provider=self.name,
            voice=voice or "mock",
            language=language,
            latency_ms=0.0,
            audio_seconds=1.0,
            meta={"note": "mock provider — no model was loaded", "text": text[:80]},
        )


_PROVIDERS = {
    "kokoro": KokoroTTS,
    "piper": PiperTTS,
    "mock": MockTTS,
}

_cache: Dict[str, BaseTTS] = {}


def get_tts(provider: Optional[str] = None) -> BaseTTS:
    """Returns a cached TTS provider instance."""
    key = (provider or config.TTS_PROVIDER).strip().lower()
    if key not in _PROVIDERS:
        raise ValueError(
            f"Unknown TTS provider '{key}'. Available: {', '.join(_PROVIDERS)}"
        )
    if key not in _cache:
        _cache[key] = _PROVIDERS[key]()
    return _cache[key]


def available_providers() -> Dict[str, bool]:
    """Maps each provider name to whether its model is currently in memory."""
    return {name: _cache[name].is_loaded if name in _cache else False for name in _PROVIDERS}


def detect_language(text: str) -> str:
    """Infers the reply language from the script the text is written in.

    SraVaani identifies languages internally but does not expose the result, so
    the pipeline cannot ask it which language was spoken. Devanagari codepoints
    are an unambiguous stand-in for Hindi; everything else falls back to
    English.
    """
    if any("ऀ" <= ch <= "ॿ" for ch in text or ""):
        return "hi"
    return "en"


def supported_languages(provider: Optional[str] = None) -> List[str]:
    """Languages the given provider can speak."""
    engine = get_tts(provider)
    if isinstance(engine, KokoroTTS):
        return sorted(engine.LANG_CODES)
    if isinstance(engine, PiperTTS):
        return sorted(engine.LANG_VOICES)
    return ["en"]
