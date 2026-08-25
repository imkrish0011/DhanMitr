"""Unit tests for DhanMITR Voice Service & Temporary Response Service."""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from backend.app.services import rag_service, voice_service
from shared.types.python.models import (
    CurrencyCode,
    EmploymentType,
    FinancialContext,
    RiskTolerance,
    TaxRegime,
    UserFinancialProfile,
    VoiceRequest,
)
from voice.stt import STTResult
from voice.tts import TTSResult


class TestVoiceHealthWarmupReadiness:
    def setup_method(self):
        voice_service.reset_voice_state()

    def test_voice_health_initial_unwarmed(self):
        health = voice_service.get_voice_health()
        assert health.service == "dhanmitr-voice"
        assert health.status == "unwarmed"
        assert health.uptime_ready is False
        assert health.stt.warmed_up is False
        assert health.tts.warmed_up is False

    @pytest.mark.asyncio
    async def test_warmup_success_sets_ready(self):
        with patch("backend.app.services.voice_service.stt_module.get_stt") as mock_stt, \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_tts:
            stt_engine = MagicMock()
            stt_engine.name = "sravaani"
            stt_engine.is_loaded = True
            mock_stt.return_value = stt_engine

            tts_engine = MagicMock()
            tts_engine.name = "kokoro"
            tts_engine.is_loaded = True
            mock_tts.return_value = tts_engine

            await voice_service.warmup_voice_models()
            health = voice_service.get_voice_health()

            assert health.status == "ready"
            assert health.uptime_ready is True
            assert health.stt.warmed_up is True
            assert health.stt.loaded is True
            assert health.stt.error is None
            assert health.tts.warmed_up is True
            assert health.tts.loaded is True
            assert health.tts.error is None

    @pytest.mark.asyncio
    async def test_warmup_stt_failure_sets_degraded(self):
        with patch("backend.app.services.voice_service.stt_module.get_stt", side_effect=RuntimeError("SraVaani gated model auth error")), \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_tts:
            tts_engine = MagicMock()
            tts_engine.name = "kokoro"
            tts_engine.is_loaded = True
            mock_tts.return_value = tts_engine

            await voice_service.warmup_voice_models()
            health = voice_service.get_voice_health()

            assert health.status == "degraded"
            assert health.uptime_ready is False
            assert health.stt.warmed_up is False
            assert health.stt.loaded is False
            assert "gated model" in health.stt.error.lower()
            assert health.tts.warmed_up is True
            assert health.tts.error is None

    @pytest.mark.asyncio
    async def test_warmup_tts_failure_sets_degraded(self):
        with patch("backend.app.services.voice_service.stt_module.get_stt") as mock_stt, \
             patch("backend.app.services.voice_service.tts_module.get_tts", side_effect=RuntimeError("Kokoro model not found")):
            stt_engine = MagicMock()
            stt_engine.name = "sravaani"
            stt_engine.is_loaded = True
            mock_stt.return_value = stt_engine

            await voice_service.warmup_voice_models()
            health = voice_service.get_voice_health()

            assert health.status == "degraded"
            assert health.uptime_ready is False
            assert health.stt.warmed_up is True
            assert health.tts.warmed_up is False
            assert "kokoro" in health.tts.error.lower()

    @pytest.mark.asyncio
    async def test_warmup_both_failure_sets_unavailable(self):
        with patch("backend.app.services.voice_service.stt_module.get_stt", side_effect=RuntimeError("STT failed")), \
             patch("backend.app.services.voice_service.tts_module.get_tts", side_effect=RuntimeError("TTS failed")):

            await voice_service.warmup_voice_models()
            health = voice_service.get_voice_health()

            assert health.status == "unavailable"
            assert health.uptime_ready is False
            assert health.stt.warmed_up is False
            assert health.tts.warmed_up is False
            assert health.stt.error is not None
            assert health.tts.error is not None


class TestVoiceChatPipelineNoSilentFallbacks:
    @pytest.mark.asyncio
    async def test_process_voice_chat_text_only(self):
        mock_tts_result = TTSResult(
            audio_path=Path("dummy.wav"),
            sample_rate=24000,
            provider="kokoro",
            voice="af_bella",
            latency_ms=12.0,
            audio_seconds=1.5,
        )

        with patch("backend.app.services.voice_service.rag_service.generate_grounded_answer") as mock_rag, \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts, \
             patch("backend.app.services.voice_service.audio_utils.wav_to_base64", return_value="bW9ja19hdWRpb19kYXRh"), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):
            mock_rag.return_value = {
                "answer": "Hello from DhanMITR",
                "reply_text": "Hello from DhanMITR",
                "language": "en",
                "sources": [],
            }
            mock_tts = MagicMock()
            mock_tts.synthesize.return_value = mock_tts_result
            mock_tts.name = "kokoro"
            mock_get_tts.return_value = mock_tts

            req = VoiceRequest(text="Hello DhanMITR", language="en")
            response = await voice_service.process_voice_chat(req)

            assert response.transcript == "Hello DhanMITR"
            assert response.audio_base64 == "bW9ja19hdWRpb19kYXRh"
            assert response.tts.provider == "kokoro"
            assert response.timing.total_ms >= 0

    @pytest.mark.asyncio
    async def test_process_voice_chat_with_audio(self):
        mock_stt_result = STTResult(
            text="Analyze my expenses",
            language="en",
            provider="sravaani",
            latency_ms=25.0,
            audio_seconds=2.0,
        )
        mock_tts_result = TTSResult(
            audio_path=Path("dummy_out.wav"),
            sample_rate=24000,
            provider="kokoro",
            voice="af_bella",
            latency_ms=18.0,
            audio_seconds=2.2,
        )

        with patch("backend.app.services.voice_service.rag_service.generate_grounded_answer") as mock_rag, \
             patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", return_value=Path("in.webm")), \
             patch("backend.app.services.voice_service.audio_utils.to_wav16k_mono", return_value=Path("in.wav")), \
             patch("backend.app.services.voice_service.stt_module.get_stt") as mock_get_stt, \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts, \
             patch("backend.app.services.voice_service.audio_utils.wav_to_base64", return_value="c3ludGhlc2l6ZWRfd2F2"), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):

            mock_rag.return_value = {
                "answer": "Expenses analyzed",
                "reply_text": "Expenses analyzed",
                "language": "en",
                "sources": [],
            }
            mock_stt = MagicMock()
            mock_stt.transcribe.return_value = mock_stt_result
            mock_stt.name = "sravaani"
            mock_get_stt.return_value = mock_stt

            mock_tts = MagicMock()
            mock_tts.synthesize.return_value = mock_tts_result
            mock_tts.name = "kokoro"
            mock_get_tts.return_value = mock_tts

            req = VoiceRequest(audio_base64="ZHVtbXlfd2VibV9kYXRh", language="en")
            response = await voice_service.process_voice_chat(req)

            assert response.transcript == "Analyze my expenses"
            assert response.audio_base64 == "c3ludGhlc2l6ZWRfd2F2"
            assert response.stt.provider == "sravaani"
            assert response.tts.provider == "kokoro"
            assert response.language == "en"
            assert response.timing.total_ms > 0

    @pytest.mark.asyncio
    async def test_configured_sravaani_failure_raises_stt_provider_error_no_fallback(self):
        with patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", return_value=Path("in.webm")), \
             patch("backend.app.services.voice_service.audio_utils.to_wav16k_mono", return_value=Path("in.wav")), \
             patch("backend.app.services.voice_service.stt_module.get_stt", side_effect=RuntimeError("SraVaani CUDA out of memory")), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):

            req = VoiceRequest(audio_base64="ZHVtbXlfd2VibV9kYXRh", language="en")
            with pytest.raises(voice_service.STTProviderError) as exc_info:
                await voice_service.process_voice_chat(req)

            assert exc_info.value.code == "STT_PROVIDER_UNAVAILABLE"
            assert "unavailable" in exc_info.value.message.lower()

    @pytest.mark.asyncio
    async def test_configured_kokoro_failure_raises_tts_provider_error_no_fallback(self):
        mock_stt_result = STTResult(
            text="Analyze my expenses",
            language="en",
            provider="sravaani",
            latency_ms=25.0,
            audio_seconds=2.0,
        )

        with patch("backend.app.services.voice_service.rag_service.generate_grounded_answer") as mock_rag, \
             patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", return_value=Path("in.webm")), \
             patch("backend.app.services.voice_service.audio_utils.to_wav16k_mono", return_value=Path("in.wav")), \
             patch("backend.app.services.voice_service.stt_module.get_stt") as mock_get_stt, \
             patch("backend.app.services.voice_service.tts_module.get_tts", side_effect=RuntimeError("Kokoro model corrupted")), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):

            mock_rag.return_value = {
                "answer": "Expenses analyzed",
                "reply_text": "Expenses analyzed",
                "language": "en",
                "sources": [],
            }
            mock_stt = MagicMock()
            mock_stt.transcribe.return_value = mock_stt_result
            mock_stt.name = "sravaani"
            mock_get_stt.return_value = mock_stt

            req = VoiceRequest(audio_base64="ZHVtbXlfd2VibV9kYXRh", language="en")
            with pytest.raises(voice_service.TTSProviderError) as exc_info:
                await voice_service.process_voice_chat(req)

            assert exc_info.value.code == "TTS_PROVIDER_UNAVAILABLE"
            assert "unavailable" in exc_info.value.message.lower()

    @pytest.mark.asyncio
    async def test_explicit_mock_stt_and_tts_provider(self):
        mock_stt_result = STTResult(
            text="Mock transcript",
            language="en",
            provider="mock",
            latency_ms=1.0,
            audio_seconds=1.0,
        )
        mock_tts_result = TTSResult(
            audio_path=Path("dummy_mock.wav"),
            sample_rate=16000,
            provider="mock",
            voice="mock",
            latency_ms=1.0,
            audio_seconds=1.0,
        )

        with patch("backend.app.services.voice_service.rag_service.generate_grounded_answer") as mock_rag, \
             patch("backend.app.services.voice_service.voice_config.STT_PROVIDER", "mock"), \
             patch("backend.app.services.voice_service.voice_config.TTS_PROVIDER", "mock"), \
             patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", return_value=Path("in.webm")), \
             patch("backend.app.services.voice_service.audio_utils.to_wav16k_mono", return_value=Path("in.wav")), \
             patch("backend.app.services.voice_service.stt_module.get_stt") as mock_get_stt, \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts, \
             patch("backend.app.services.voice_service.audio_utils.wav_to_base64", return_value="bW9ja193YXY="), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):

            mock_rag.return_value = {
                "answer": "Mock reply",
                "reply_text": "Mock reply",
                "language": "en",
                "sources": [],
            }
            mock_stt = MagicMock()
            mock_stt.transcribe.return_value = mock_stt_result
            mock_stt.name = "mock"
            mock_get_stt.return_value = mock_stt

            mock_tts = MagicMock()
            mock_tts.synthesize.return_value = mock_tts_result
            mock_tts.name = "mock"
            mock_get_tts.return_value = mock_tts

            req = VoiceRequest(audio_base64="ZHVtbXlfd2VibV9kYXRh", language="en")
            response = await voice_service.process_voice_chat(req)

            assert response.transcript == "Mock transcript"
            assert response.stt.provider == "mock"
            assert response.tts.provider == "mock"

    @pytest.mark.asyncio
    async def test_process_voice_chat_empty_request_raises_value_error(self):
        req = VoiceRequest()
        with pytest.raises(ValueError, match="Either audio_base64 or text"):
            await voice_service.process_voice_chat(req)


class TestStreamVoiceChat:
    @pytest.mark.asyncio
    async def test_stream_voice_chat_yields_audio_chunks(self):
        with patch("backend.app.services.voice_service.rag_service.generate_grounded_answer") as mock_rag, \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts:

            mock_rag.return_value = {
                "answer": "Test answer",
                "reply_text": "Test speech",
                "language": "en",
                "sources": [],
            }

            mock_tts = MagicMock()
            mock_tts.synthesize_stream.return_value = [b"chunk1_wav", b"chunk2_wav"]
            mock_get_tts.return_value = mock_tts

            req = VoiceRequest(text="Hello", language="en")
            chunks = []
            async for chunk in voice_service.stream_voice_chat(req):
                chunks.append(chunk)

            assert len(chunks) == 2
            assert chunks[0] == b"chunk1_wav"
            assert chunks[1] == b"chunk2_wav"
            mock_tts.synthesize_stream.assert_called_once_with("Test speech", language="en", voice=None)

