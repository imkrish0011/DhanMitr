"""Voice API router for DhanMITR Voice Assistant."""

import logging
from fastapi import APIRouter, HTTPException, status
from shared.types.python.models import (
    STTTelemetry,
    TTSTelemetry,
    VoiceHealthResponse,
    VoiceRequest,
    VoiceResponse,
    VoiceTimingTelemetry,
)
from backend.app.services import voice_service
from voice.audio_utils import AudioError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/chat",
    response_model=VoiceResponse,
    status_code=status.HTTP_200_OK,
    summary="Process voice input and generate synthesized voice response",
)
async def voice_chat(request: VoiceRequest) -> VoiceResponse:
    """End-to-end voice chat endpoint.

    Transcribes audio with SraVaani STT, generates temporary financial insight response,
    and synthesizes speech output with Kokoro TTS.
    """
    try:
        response = await voice_service.process_voice_chat(request)
        return response
    except ValueError as exc:
        logger.warning("Invalid voice request payload: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except AudioError as exc:
        logger.warning("Audio decoding/transcoding failed: %s", exc)
        return VoiceResponse(
            transcript="",
            answer="Audio could not be decoded. Please tap the microphone and speak clearly.",
            reply_text="Audio could not be decoded. Please try speaking again.",
            audio_base64=None,
            audio_format="audio/wav",
            language=request.language or "en",
            duration_seconds=0.0,
            latency_ms=0.0,
            stt=STTTelemetry(provider="none", latency_ms=0.0),
            tts=TTSTelemetry(provider="none", voice="", latency_ms=0.0),
            timing=VoiceTimingTelemetry(total_ms=0.0),
        )
    except (voice_service.STTProviderError, voice_service.TTSProviderError) as exc:
        logger.error("Voice provider unavailable: %s (code: %s)", exc.message, exc.code)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                }
            },
        ) from exc
    except voice_service.VoiceServiceError as exc:
        logger.error("Voice service error: %s (code: %s)", exc.message, exc.code)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                }
            },
        ) from exc
    except Exception as exc:
        logger.error("Voice pipeline execution error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "VOICE_INTERNAL_ERROR",
                    "message": "Failed to process voice request. Please check server logs.",
                }
            },
        ) from exc


@router.get(
    "/health",
    response_model=VoiceHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check status and model pre-warming state of Voice pipeline",
)
async def voice_health() -> VoiceHealthResponse:
    """Returns provider status, pre-warm timings, and model readiness."""
    return voice_service.get_voice_health()
