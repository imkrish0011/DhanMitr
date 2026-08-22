"""Unit tests for DhanMITR Voice Service."""

import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from backend.app.services import voice_service
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


class TestVoiceHealth:
    def test_voice_health_structure(self):
        health = voice_service.get_voice_health()
        assert health.service == "dhanmitr-voice"
        assert health.status in ["ready", "warming", "unwarmed", "degraded"]
        assert "configured_provider" in health.stt
        assert "configured_provider" in health.tts
        assert "supported_languages" in health.tts


class TestTemporaryFinancialResponses:
    @pytest.fixture
    def sample_context(self):
        profile = UserFinancialProfile(
            user_id="test-user-123",
            currency=CurrencyCode.INR,
            monthly_income=100000.0,
            monthly_expenses=45000.0,
            emergency_fund_balance=250000.0,
            total_investments=500000.0,
            total_liabilities=50000.0,
            risk_tolerance=RiskTolerance.MODERATE,
            employment_type=EmploymentType.SALARIED,
            tax_regime=TaxRegime.NEW,
        )
        return FinancialContext(
            profile=profile,
            net_worth=700000.0,
            savings_rate_percentage=55.0,
            top_spending_categories=[],
            active_subscriptions_total=1200.0,
        )

    def test_english_pmjjby(self, sample_context):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "What is PMJJBY insurance scheme?", "en", sample_context
        )
        assert "PMJJBY" in text or "Pradhan Mantri" in text
        assert "436" in voice
        assert lang == "en"

    def test_english_tax(self, sample_context):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "Explain old vs new tax regime", "en", sample_context
        )
        assert "7.75" in text or "Tax" in text
        assert "Regime" in voice
        assert lang == "en"

    def test_english_expenses(self, sample_context):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "What are my monthly expenses?", "en", sample_context
        )
        assert "45,000" in text
        assert "45,000" in voice
        assert lang == "en"

    def test_english_savings(self, sample_context):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "How can I save more money?", "en", sample_context
        )
        assert "surplus" in text.lower() or "saving" in text.lower()
        assert lang == "en"

    def test_hindi_pmjjby(self, sample_context):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "पीएमजेजेबीवाई बीमा योजना क्या है?", "hi", sample_context
        )
        assert "प्रधानमंत्री" in text or "बीमा" in text
        assert "436" in voice
        assert lang == "hi"

    def test_hindi_tax(self, sample_context):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "टैक्स रिजीम के बारे में बताएं", "hi", sample_context
        )
        assert "टैक्स" in text or "रिजीम" in text
        assert "7.75" in voice or "टैक्स" in voice
        assert lang == "hi"

    def test_hindi_expenses(self, sample_context):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "मेरे खर्चों का विश्लेषण करें", "hi", sample_context
        )
        assert "45,000" in text
        assert "45,000" in voice
        assert lang == "hi"

    def test_empty_financial_profile(self):
        text, voice, lang = voice_service.generate_temporary_financial_response(
            "Analyze my spending", "en", None
        )
        assert "Finance Hub" in text
        assert "Finance" in voice or "income" in voice
        assert lang == "en"


class TestVoiceChatPipeline:
    @pytest.mark.asyncio
    async def test_process_voice_chat_text_only(self):
        mock_tts_result = TTSResult(
            audio_path=Path("dummy.wav"),
            sample_rate=24000,
            provider="mock_tts",
            voice="test_voice",
            latency_ms=12.0,
            audio_seconds=1.5,
        )

        with patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts, \
             patch("backend.app.services.voice_service.audio_utils.wav_to_base64", return_value="bW9ja19hdWRpb19kYXRh"), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):
            mock_tts = MagicMock()
            mock_tts.synthesize.return_value = mock_tts_result
            mock_tts.name = "mock_tts"
            mock_get_tts.return_value = mock_tts

            req = VoiceRequest(text="Hello DhanMITR", language="en")
            response = await voice_service.process_voice_chat(req)

            assert response.transcript == "Hello DhanMITR"
            assert response.audio_base64 == "bW9ja19hdWRpb19kYXRh"
            assert response.tts.provider == "mock_tts"
            assert response.timing.total_ms >= 0

    @pytest.mark.asyncio
    async def test_process_voice_chat_with_audio(self):
        mock_stt_result = STTResult(
            text="Analyze my expenses",
            language="en",
            provider="mock_stt",
            latency_ms=25.0,
            audio_seconds=2.0,
        )
        mock_tts_result = TTSResult(
            audio_path=Path("dummy_out.wav"),
            sample_rate=24000,
            provider="mock_tts",
            voice="af_bella",
            latency_ms=18.0,
            audio_seconds=2.2,
        )

        with patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", return_value=Path("in.webm")), \
             patch("backend.app.services.voice_service.audio_utils.to_wav16k_mono", return_value=Path("in.wav")), \
             patch("backend.app.services.voice_service.stt_module.get_stt") as mock_get_stt, \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts, \
             patch("backend.app.services.voice_service.audio_utils.wav_to_base64", return_value="c3ludGhlc2l6ZWRfd2F2"), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):

            mock_stt = MagicMock()
            mock_stt.transcribe.return_value = mock_stt_result
            mock_stt.name = "mock_stt"
            mock_get_stt.return_value = mock_stt

            mock_tts = MagicMock()
            mock_tts.synthesize.return_value = mock_tts_result
            mock_tts.name = "mock_tts"
            mock_get_tts.return_value = mock_tts

            req = VoiceRequest(audio_base64="ZHVtbXlfd2VibV9kYXRh", language="en")
            response = await voice_service.process_voice_chat(req)

            assert response.transcript == "Analyze my expenses"
            assert response.audio_base64 == "c3ludGhlc2l6ZWRfd2F2"
            assert response.stt.provider == "mock_stt"
            assert response.tts.provider == "mock_tts"
            assert response.language == "en"
            assert response.timing.total_ms > 0

    @pytest.mark.asyncio
    async def test_process_voice_chat_empty_request_raises_value_error(self):
        req = VoiceRequest()
        with pytest.raises(ValueError, match="Either audio_base64 or text"):
            await voice_service.process_voice_chat(req)
