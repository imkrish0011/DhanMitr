"""Voice Processing Service for DhanMITR.

Orchestrates Speech-to-Text (SraVaani / FasterWhisper), Modular Temporary
Financial Response Generation, and Text-to-Speech (Kokoro). Pre-warms models
during application startup and tracks provider readiness independently.
"""

import asyncio
import logging
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

# Ensure voice package is resolvable
ROOT_DIR = Path(__file__).resolve().parents[3]
VOICE_DIR = ROOT_DIR / "voice"
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(VOICE_DIR) not in sys.path:
    sys.path.insert(0, str(VOICE_DIR))

import voice.audio_utils as audio_utils
import voice.config as voice_config
import voice.stt as stt_module
import voice.tts as tts_module
from backend.app.services.temporary_response_service import (
    generate_temporary_financial_response,
)
from shared.types.python.models import (
    FinancialContext,
    STTTelemetry,
    TTSTelemetry,
    VoiceHealthProviderStatus,
    VoiceHealthResponse,
    VoiceRequest,
    VoiceResponse,
    VoiceTimingTelemetry,
)

logger = logging.getLogger(__name__)


class VoiceServiceError(Exception):
    """Raised when voice pipeline encounters an error."""


# ---------------------------------------------------------------------------
# Global Service State & Independent Provider Tracking
# ---------------------------------------------------------------------------

def _initial_provider_state(provider_name: str) -> Dict[str, Any]:
    return {
        "provider": provider_name,
        "initialized": False,
        "loaded": False,
        "warmup_success": False,
        "warmup_error": None,
        "warmup_duration_ms": 0.0,
    }


_state: Dict[str, Any] = {
    "is_warming": False,
    "stt": _initial_provider_state(voice_config.STT_PROVIDER),
    "tts": _initial_provider_state(voice_config.TTS_PROVIDER),
}


def reset_voice_state() -> None:
    """Resets global warmup state (useful for test fixtures & simulated failures)."""
    global _state
    _state["is_warming"] = False
    _state["stt"] = _initial_provider_state(voice_config.STT_PROVIDER)
    _state["tts"] = _initial_provider_state(voice_config.TTS_PROVIDER)


# ---------------------------------------------------------------------------
# Model Warmup Lifecycle
# ---------------------------------------------------------------------------

def _run_warmup_sync() -> Dict[str, Any]:
    """Executes warmup for STT and TTS synchronously (executed in thread pool)."""
    global _state
    stt_provider = voice_config.STT_PROVIDER
    tts_provider = voice_config.TTS_PROVIDER

    _state["stt"]["provider"] = stt_provider
    _state["stt"]["initialized"] = True
    _state["tts"]["provider"] = tts_provider
    _state["tts"]["initialized"] = True

    # 1. Warm up STT Provider
    t0_stt = time.perf_counter()
    try:
        stt_engine = stt_module.get_stt(stt_provider)
        stt_engine.warmup()
        stt_ms = round((time.perf_counter() - t0_stt) * 1000, 1)
        _state["stt"]["loaded"] = stt_engine.is_loaded
        _state["stt"]["warmup_success"] = True
        _state["stt"]["warmup_error"] = None
        _state["stt"]["warmup_duration_ms"] = stt_ms
        logger.info(
            "STT provider '%s' initialized and warmed up in %s ms",
            stt_engine.name,
            stt_ms,
        )
    except Exception as exc:
        stt_ms = round((time.perf_counter() - t0_stt) * 1000, 1)
        _state["stt"]["loaded"] = False
        _state["stt"]["warmup_success"] = False
        _state["stt"]["warmup_error"] = str(exc)
        _state["stt"]["warmup_duration_ms"] = stt_ms
        logger.error("STT warmup failed for '%s': %s", stt_provider, exc)

    # 2. Warm up TTS Provider
    t0_tts = time.perf_counter()
    try:
        tts_engine = tts_module.get_tts(tts_provider)
        tts_engine.warmup()
        tts_ms = round((time.perf_counter() - t0_tts) * 1000, 1)
        _state["tts"]["loaded"] = tts_engine.is_loaded
        _state["tts"]["warmup_success"] = True
        _state["tts"]["warmup_error"] = None
        _state["tts"]["warmup_duration_ms"] = tts_ms
        logger.info(
            "TTS provider '%s' initialized and warmed up in %s ms",
            tts_engine.name,
            tts_ms,
        )
    except Exception as exc:
        tts_ms = round((time.perf_counter() - t0_tts) * 1000, 1)
        _state["tts"]["loaded"] = False
        _state["tts"]["warmup_success"] = False
        _state["tts"]["warmup_error"] = str(exc)
        _state["tts"]["warmup_duration_ms"] = tts_ms
        logger.error("TTS warmup failed for '%s': %s", tts_provider, exc)

    return {
        "stt_success": _state["stt"]["warmup_success"],
        "tts_success": _state["tts"]["warmup_success"],
    }


async def warmup_voice_models() -> None:
    """Pre-loads and warms up STT and TTS models during backend startup."""
    global _state
    if _state["is_warming"]:
        return

    _state["is_warming"] = True
    logger.info(
        "Starting DhanMITR Voice model pre-warming (STT: %s, TTS: %s)...",
        voice_config.STT_PROVIDER,
        voice_config.TTS_PROVIDER,
    )

    try:
        await asyncio.to_thread(_run_warmup_sync)
    finally:
        _state["is_warming"] = False


# ---------------------------------------------------------------------------
# Health & Readiness Evaluation
# ---------------------------------------------------------------------------

def get_voice_health() -> VoiceHealthResponse:
    """Evaluates readiness of STT and TTS providers with strict status computation."""
    stt_info = _state["stt"]
    tts_info = _state["tts"]

    # Determine status
    if _state["is_warming"]:
        status = "warming"
    elif not stt_info["initialized"] and not tts_info["initialized"]:
        status = "unwarmed"
    elif stt_info["warmup_success"] and tts_info["warmup_success"]:
        status = "ready"
    elif stt_info["warmup_success"] or tts_info["warmup_success"]:
        status = "degraded"
    else:
        status = "unavailable"

    is_ready = (status == "ready")

    stt_status = VoiceHealthProviderStatus(
        provider=stt_info["provider"],
        loaded=stt_info["loaded"],
        warmed_up=stt_info["warmup_success"],
        error=stt_info["warmup_error"],
        warmup_ms=stt_info["warmup_duration_ms"],
    )

    tts_status = VoiceHealthProviderStatus(
        provider=tts_info["provider"],
        loaded=tts_info["loaded"],
        warmed_up=tts_info["warmup_success"],
        error=tts_info["warmup_error"],
        warmup_ms=tts_info["warmup_duration_ms"],
    )

    return VoiceHealthResponse(
        status=status,
        service="dhanmitr-voice",
        stt=stt_status,
        tts=tts_status,
        uptime_ready=is_ready,
    )


# ---------------------------------------------------------------------------
# Core Audio Processing Pipeline
# ---------------------------------------------------------------------------

def _process_voice_sync(
    audio_base64: str,
    language_hint: Optional[str] = None,
    voice_id: Optional[str] = None,
    financial_context: Optional[FinancialContext] = None,
) -> Dict[str, Any]:
    """Synchronous pipeline executed in thread pool."""
    pipeline_start = time.perf_counter()
    raw_tmp: Optional[Path] = None
    wav_tmp: Optional[Path] = None
    tts_out: Optional[Path] = None

    try:
        # 1. Decode base64 audio
        raw_tmp = audio_utils.decode_base64_audio(audio_base64)

        # 2. Transcode to 16 kHz mono WAV
        wav_tmp = audio_utils.to_wav16k_mono(raw_tmp)

        # 3. Speech-to-Text Transcription with cached provider
        stt_result = None
        for engine_key in [None, "faster_whisper", "mock"]:
            try:
                stt_engine = stt_module.get_stt(engine_key)
                stt_result = stt_engine.transcribe(wav_tmp, language=language_hint)
                break
            except Exception as stt_err:
                logger.warning(
                    "STT provider '%s' failed, trying next: %s",
                    engine_key or voice_config.STT_PROVIDER,
                    stt_err,
                )

        if not stt_result:
            stt_engine = stt_module.get_stt("mock")
            stt_result = stt_engine.transcribe(wav_tmp, language=language_hint)

        transcript = (stt_result.text or "").strip()

        # If no speech was detected in the audio
        if not transcript:
            answer_text = (
                "No speech was detected. Please try speaking into the microphone again."
                if language_hint != "hi"
                else "कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें।"
            )
            spoken_reply = answer_text
            reply_lang = "hi" if language_hint == "hi" else "en"
        else:
            # 4. Generate Temporary Financial Response (NO RAG/LLM)
            answer_text, spoken_reply, reply_lang = generate_temporary_financial_response(
                query=transcript,
                language_hint=language_hint or stt_result.language,
                context=financial_context,
            )

        # 5. Text-to-Speech Synthesis with cached provider
        try:
            tts_engine = tts_module.get_tts()
            tts_result = tts_engine.synthesize(
                text=spoken_reply,
                language=reply_lang,
                voice=voice_id,
            )
        except Exception as tts_err:
            logger.warning("Primary TTS provider error, falling back to mock: %s", tts_err)
            tts_engine = tts_module.get_tts("mock")
            tts_result = tts_engine.synthesize(
                text=spoken_reply,
                language=reply_lang,
                voice=voice_id,
            )

        tts_out = tts_result.audio_path

        # 6. Encode synthesized audio to base64
        audio_b64_output = audio_utils.wav_to_base64(tts_out)

        total_ms = round((time.perf_counter() - pipeline_start) * 1000, 1)

        return {
            "transcript": transcript,
            "answer": answer_text,
            "reply_text": answer_text,
            "audio_base64": audio_b64_output,
            "audio_format": "audio/wav",
            "language": reply_lang,
            "duration_seconds": tts_result.audio_seconds,
            "latency_ms": total_ms,
            "stt": {
                "provider": stt_result.provider,
                "latency_ms": stt_result.latency_ms,
            },
            "tts": {
                "provider": tts_result.provider,
                "voice": tts_result.voice,
                "latency_ms": tts_result.latency_ms,
            },
            "timing": {
                "total_ms": total_ms,
            },
        }

    finally:
        # Always clean up temporary files defensively
        audio_utils.cleanup(raw_tmp, wav_tmp, tts_out)


async def process_voice_chat(request: VoiceRequest) -> VoiceResponse:
    """Async handler for POST /api/v1/voice/chat."""
    if not request.audio_base64 and not request.text:
        raise ValueError("Either audio_base64 or text must be provided in VoiceRequest.")

    parsed_context = None
    if request.financial_context:
        if isinstance(request.financial_context, FinancialContext):
            parsed_context = request.financial_context
        elif isinstance(request.financial_context, dict):
            try:
                parsed_context = FinancialContext.model_validate(request.financial_context)
            except Exception:
                parsed_context = None

    if request.audio_base64:
        data = await asyncio.to_thread(
            _process_voice_sync,
            request.audio_base64,
            request.language,
            request.voice_id,
            parsed_context,
        )
        return VoiceResponse(
            transcript=data["transcript"],
            answer=data["answer"],
            reply_text=data["reply_text"],
            audio_base64=data["audio_base64"],
            audio_format=data["audio_format"],
            language=data["language"],
            duration_seconds=data.get("duration_seconds"),
            latency_ms=data.get("latency_ms"),
            stt=STTTelemetry(**data["stt"]),
            tts=TTSTelemetry(**data["tts"]),
            timing=VoiceTimingTelemetry(**data["timing"]),
        )

    # Standalone text chat path
    text_input = (request.text or "").strip()
    t0 = time.perf_counter()
    answer_text, spoken_reply, reply_lang = generate_temporary_financial_response(
        query=text_input,
        language_hint=request.language or "en",
        context=parsed_context,
    )

    try:
        tts_engine = tts_module.get_tts()
        tts_result = await asyncio.to_thread(
            tts_engine.synthesize,
            spoken_reply,
            reply_lang,
            request.voice_id,
        )
    except Exception as tts_err:
        logger.warning("TTS error in text chat, fallback to mock: %s", tts_err)
        tts_engine = tts_module.get_tts("mock")
        tts_result = await asyncio.to_thread(
            tts_engine.synthesize,
            spoken_reply,
            reply_lang,
            request.voice_id,
        )

    b64 = audio_utils.wav_to_base64(tts_result.audio_path)
    audio_utils.cleanup(tts_result.audio_path)
    total_ms = round((time.perf_counter() - t0) * 1000, 1)

    return VoiceResponse(
        transcript=text_input,
        answer=answer_text,
        reply_text=answer_text,
        audio_base64=b64,
        audio_format="audio/wav",
        language=reply_lang,
        duration_seconds=tts_result.audio_seconds,
        latency_ms=total_ms,
        stt=STTTelemetry(provider="none", latency_ms=0.0),
        tts=TTSTelemetry(
            provider=tts_result.provider,
            voice=tts_result.voice,
            latency_ms=tts_result.latency_ms,
        ),
        timing=VoiceTimingTelemetry(total_ms=total_ms),
    )
