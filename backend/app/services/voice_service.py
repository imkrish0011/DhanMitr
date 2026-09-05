"""Voice Processing Service for DhanMITR.

Orchestrates Speech-to-Text (SraVaani / configured STT), Modular Temporary
Financial Response Generation, and Text-to-Speech (Kokoro / configured TTS).
Pre-warms models during application startup, tracks provider readiness
independently, and strictly executes configured providers without silent
production fallbacks.
"""

import asyncio
import logging
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional

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
from backend.app.services import rag_service
from shared.types.python.models import (
    FinancialContext,
    KnowledgeSource,
    STTTelemetry,
    TTSTelemetry,
    VoiceHealthProviderStatus,
    VoiceHealthResponse,
    VoiceRequest,
    VoiceResponse,
    VoiceTimingTelemetry,
)
from backend.app.core.language_detector import detect_language, normalize_indic_script_to_devanagari
from backend.app.core.telemetry import log_pipeline_latency

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Structured Exceptions for Production Provider Failures
# ---------------------------------------------------------------------------

class VoiceServiceError(Exception):
    """Base exception for voice service errors."""

    def __init__(
        self,
        message: str = "Voice service error.",
        code: str = "VOICE_SERVICE_ERROR",
    ):
        super().__init__(message)
        self.message = message
        self.code = code


class STTProviderError(VoiceServiceError):
    """Raised when the configured STT provider fails or is unavailable."""

    def __init__(
        self,
        message: str = "Configured STT provider is unavailable.",
        code: str = "STT_PROVIDER_UNAVAILABLE",
    ):
        super().__init__(message=message, code=code)


class TTSProviderError(VoiceServiceError):
    """Raised when the configured TTS provider fails or is unavailable."""

    def __init__(
        self,
        message: str = "Configured TTS provider is unavailable.",
        code: str = "TTS_PROVIDER_UNAVAILABLE",
    ):
        super().__init__(message=message, code=code)


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

    # 1. Warm up Configured STT Provider
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
        logger.error(
            "Configured STT warmup failed for '%s': %s",
            stt_provider,
            exc,
            exc_info=True,
        )

    # 2. Warm up Configured TTS Provider
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
        logger.error(
            "Configured TTS warmup failed for '%s': %s",
            tts_provider,
            exc,
            exc_info=True,
        )

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
# Core Audio Processing Pipeline (No Silent Fallbacks)
# ---------------------------------------------------------------------------

def _process_voice_sync(
    audio_base64: str,
    language_hint: Optional[str] = None,
    voice_id: Optional[str] = None,
    financial_context: Optional[FinancialContext] = None,
    history: Optional[Any] = None,
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

        # 3. Speech-to-Text Transcription with automatic audio language detection
        stt_provider = voice_config.STT_PROVIDER
        try:
            stt_engine = stt_module.get_stt(stt_provider)
            stt_lang_hint = None if not language_hint or language_hint.strip().lower() in ("auto", "none") else language_hint
            stt_result = stt_engine.transcribe(wav_tmp, language=stt_lang_hint)
        except Exception as stt_err:
            logger.error(
                "Configured STT provider '%s' failed during transcription: %s",
                stt_provider,
                stt_err,
                exc_info=True,
            )
            raise STTProviderError(
                message="Configured STT provider is unavailable.",
                code="STT_PROVIDER_UNAVAILABLE",
            ) from stt_err

        raw_transcript = (stt_result.text or "").strip()
        transcript = normalize_indic_script_to_devanagari(raw_transcript)

        rag_sources = []
        rag_ms = 0.0
        llm_ms = 0.0
        lang_reason = "auto_detected"

        # If no speech was detected in the audio
        if not transcript:
            effective_hint = (stt_result.language or language_hint or "").lower()
            answer_text = (
                "कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें।"
                if effective_hint == "hi"
                else "No speech was detected. Please try speaking into the microphone again."
            )
            spoken_reply = answer_text
            reply_lang = "hi" if effective_hint == "hi" else "en"
        else:
            # 4. Generate Grounded RAG / Live Market / Financial Response
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                rag_out = loop.run_until_complete(
                    rag_service.generate_grounded_answer(
                        question=transcript,
                        financial_context=financial_context,
                        language=stt_result.language or language_hint or "en",
                        history=history,
                    )
                )
                loop.close()
                answer_text = rag_out["answer"]
                spoken_reply = rag_out["reply_text"]
                reply_lang = rag_out["language"]
                rag_sources = rag_out.get("sources", [])
                rag_ms = rag_out.get("rag_ms", 0.0)
                llm_ms = rag_out.get("llm_ms", 0.0)
                lang_reason = rag_out.get("language_reason", f"stt_{stt_result.language or 'auto'}")
            except Exception as rag_err:
                logger.error("RAG answer generation failed in voice pipeline: %s", rag_err, exc_info=True)
                detected_lang, _ = detect_language(transcript, language_hint=stt_result.language)
                if detected_lang == "hi":
                    answer_text = "क्षमा करें, इस समय आपका अनुरोध प्रोसेस करने में समस्या आई। कृपया पुनः प्रयास करें।"
                else:
                    answer_text = "I apologize, but I encountered an error retrieving that financial information. Please try asking again."
                spoken_reply = answer_text
                reply_lang = detected_lang

        # 5. Text-to-Speech Synthesis with strictly configured provider
        tts_provider = voice_config.TTS_PROVIDER
        t0_tts = time.perf_counter()
        try:
            tts_engine = tts_module.get_tts(tts_provider)
            tts_result = tts_engine.synthesize(
                text=spoken_reply,
                language=reply_lang,
                voice=voice_id,
            )
        except Exception as tts_err:
            logger.error(
                "Configured TTS provider '%s' failed during synthesis: %s",
                tts_provider,
                tts_err,
                exc_info=True,
            )
            raise TTSProviderError(
                message="Configured TTS provider is unavailable.",
                code="TTS_PROVIDER_UNAVAILABLE",
            ) from tts_err

        tts_ms = round((time.perf_counter() - t0_tts) * 1000, 1)
        tts_out = tts_result.audio_path

        # 6. Encode synthesized audio to base64
        audio_b64_output = audio_utils.wav_to_base64(tts_out)

        total_ms = round((time.perf_counter() - pipeline_start) * 1000, 1)

        stt_lang_prob = (stt_result.meta or {}).get("language_probability")

        # Structured Console Performance Logging
        log_pipeline_latency(
            endpoint="/api/v1/voice/chat (Audio Voice Stream)",
            query_text=transcript,
            language=reply_lang,
            language_reason=lang_reason,
            total_ms=total_ms,
            stt_provider=stt_result.provider,
            stt_ms=stt_result.latency_ms,
            stt_language=stt_result.language,
            stt_lang_prob=stt_lang_prob,
            stt_audio_seconds=stt_result.audio_seconds,
            stt_rtf=stt_result.rtf,
            rag_chunks_count=len(rag_sources),
            rag_ms=rag_ms,
            llm_model=voice_config.os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
            llm_ms=llm_ms,
            tts_provider=tts_result.provider,
            tts_voice=tts_result.voice,
            tts_ms=tts_ms,
            sources=rag_sources,
        )

        return {
            "transcript": transcript,
            "answer": answer_text,
            "reply_text": spoken_reply,
            "audio_base64": audio_b64_output,
            "audio_format": "audio/wav",
            "language": reply_lang,
            "duration_seconds": tts_result.audio_seconds,
            "latency_ms": total_ms,
            "sources": rag_sources,
            "stt": {
                "provider": stt_result.provider,
                "latency_ms": stt_result.latency_ms,
                "detected_language": stt_result.language,
                "language_probability": stt_lang_prob,
                "audio_duration_seconds": stt_result.audio_seconds,
                "rtf": stt_result.rtf,
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
            request.history,
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
            sources=[KnowledgeSource(**s) for s in data.get("sources", [])],
        )

    # Standalone text chat path
    raw_text_input = (request.text or "").strip()
    text_input = normalize_indic_script_to_devanagari(raw_text_input)
    t0 = time.perf_counter()
    rag_sources = []
    rag_ms = 0.0
    llm_ms = 0.0
    lang_reason = "text_auto_detected"
    try:
        rag_out = await rag_service.generate_grounded_answer(
            question=text_input,
            financial_context=parsed_context,
            language=request.language or "en",
            history=request.history,
        )
        answer_text = rag_out["answer"]
        spoken_reply = rag_out["reply_text"]
        reply_lang = rag_out["language"]
        rag_sources = rag_out.get("sources", [])
        rag_ms = rag_out.get("rag_ms", 0.0)
        llm_ms = rag_out.get("llm_ms", 0.0)
        lang_reason = rag_out.get("language_reason", "text_detected")
    except Exception as rag_err:
        logger.error("RAG answer generation failed in text chat: %s", rag_err, exc_info=True)
        detected_lang, _ = detect_language(text_input, request.language)
        if detected_lang == "hi":
            answer_text = "क्षमा करें, इस समय आपका अनुरोध प्रोसेस करने में समस्या आई। कृपया पुनः प्रयास करें।"
        else:
            answer_text = "I apologize, but I encountered an error retrieving that financial information. Please try asking again."
        spoken_reply = answer_text
        reply_lang = detected_lang

    tts_provider = voice_config.TTS_PROVIDER
    t0_tts = time.perf_counter()
    b64 = None
    audio_secs = 0.0
    tts_ms = 0.0
    actual_tts_provider = "none"
    actual_tts_voice = ""

    try:
        tts_engine = tts_module.get_tts(tts_provider)
        tts_result = await asyncio.to_thread(
            tts_engine.synthesize,
            spoken_reply,
            reply_lang,
            request.voice_id,
        )
        tts_ms = round((time.perf_counter() - t0_tts) * 1000, 1)
        b64 = audio_utils.wav_to_base64(tts_result.audio_path)
        audio_secs = tts_result.audio_seconds or 0.0
        actual_tts_provider = tts_result.provider
        actual_tts_voice = tts_result.voice
        audio_utils.cleanup(tts_result.audio_path)
    except Exception as tts_err:
        logger.warning(
            "TTS provider '%s' failed in text chat synthesis: %s (returning text-only)",
            tts_provider,
            tts_err,
        )

    total_ms = round((time.perf_counter() - t0) * 1000, 1)

    # Structured Console Performance Logging
    log_pipeline_latency(
        endpoint="/api/v1/voice/chat (Text Chat)",
        query_text=text_input,
        language=reply_lang,
        language_reason=lang_reason,
        total_ms=total_ms,
        stt_provider="none",
        stt_ms=0.0,
        rag_chunks_count=len(rag_sources),
        rag_ms=rag_ms,
        llm_model=voice_config.os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        llm_ms=llm_ms,
        tts_provider=actual_tts_provider,
        tts_voice=actual_tts_voice,
        tts_ms=tts_ms,
        sources=rag_sources,
    )

    return VoiceResponse(
        transcript=text_input,
        answer=answer_text,
        reply_text=spoken_reply,
        audio_base64=b64,
        audio_format="audio/wav",
        language=reply_lang,
        duration_seconds=audio_secs,
        latency_ms=total_ms,
        stt=STTTelemetry(provider="none", latency_ms=0.0),
        tts=TTSTelemetry(
            provider=actual_tts_provider,
            voice=actual_tts_voice,
            latency_ms=tts_ms,
        ),
        timing=VoiceTimingTelemetry(total_ms=total_ms),
        sources=[KnowledgeSource(**s) for s in rag_sources],
    )


async def stream_voice_chat(request: VoiceRequest):
    """Async generator yielding real-time synthesized WAV audio byte chunks for <1.2s voice latency."""
    transcript = (request.text or "").strip()
    effective_lang = request.language or "en"

    # 1. Transcribe audio if audio_base64 is provided
    if request.audio_base64:
        raw_tmp = None
        wav_tmp = None
        try:
            raw_tmp = audio_utils.decode_base64_audio(request.audio_base64)
            wav_tmp = audio_utils.to_wav16k_mono(raw_tmp)
            stt_engine = stt_module.get_stt(voice_config.STT_PROVIDER)
            stt_res = await asyncio.to_thread(
                stt_engine.transcribe,
                wav_tmp,
                request.language,
            )
            transcript = (stt_res.text or "").strip()
            if stt_res.language:
                effective_lang = stt_res.language
        finally:
            audio_utils.cleanup(raw_tmp, wav_tmp)

    if not transcript:
        no_speech = (
            "कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें।"
            if effective_lang == "hi"
            else "No speech was detected. Please try speaking into the microphone again."
        )
        tts_engine = tts_module.get_tts(voice_config.TTS_PROVIDER)
        for chunk in tts_engine.synthesize_stream(no_speech, language=effective_lang, voice=request.voice_id):
            yield chunk
        return

    # 2. Get grounded answer from RAG
    parsed_context = None
    if request.financial_context:
        if isinstance(request.financial_context, FinancialContext):
            parsed_context = request.financial_context
        elif isinstance(request.financial_context, dict):
            try:
                parsed_context = FinancialContext.model_validate(request.financial_context)
            except Exception:
                parsed_context = None

    rag_out = await rag_service.generate_grounded_answer(
        question=transcript,
        financial_context=parsed_context,
        language=effective_lang,
        history=request.history,
    )
    spoken_reply = rag_out["reply_text"]
    reply_lang = rag_out["language"]

    # 3. Stream TTS chunks sentence-by-sentence directly to client
    tts_engine = tts_module.get_tts(voice_config.TTS_PROVIDER)
    for audio_chunk in tts_engine.synthesize_stream(spoken_reply, language=reply_lang, voice=request.voice_id):
        yield audio_chunk
