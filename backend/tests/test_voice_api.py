"""Integration tests for DhanMITR Voice API Endpoints."""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from voice.audio_utils import AudioError
from voice.stt import STTResult
from voice.tts import TTSResult

client = TestClient(app)

VOICE_CHAT_URL = "/api/v1/voice/chat"
VOICE_HEALTH_URL = "/api/v1/voice/health"


class TestVoiceHealthEndpoint:
    def test_get_voice_health(self):
        resp = client.get(VOICE_HEALTH_URL)
        assert resp.status_code == 200
        data = resp.json()
        assert data["service"] == "dhanmitr-voice"
        assert "status" in data
        assert "stt" in data
        assert "tts" in data


class TestVoiceChatEndpoint:
    def test_voice_chat_with_audio_payload(self):
        mock_stt_result = STTResult(
            text="What is my current monthly budget?",
            language="en",
            provider="sravaani",
            latency_ms=45.0,
            audio_seconds=1.8,
        )
        mock_tts_result = TTSResult(
            audio_path=Path("dummy.wav"),
            sample_rate=24000,
            provider="kokoro",
            voice="af_bella",
            latency_ms=30.0,
            audio_seconds=2.0,
        )

        with patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", return_value=Path("raw.webm")), \
             patch("backend.app.services.voice_service.audio_utils.to_wav16k_mono", return_value=Path("wav.wav")), \
             patch("backend.app.services.voice_service.stt_module.get_stt") as mock_get_stt, \
             patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts, \
             patch("backend.app.services.voice_service.audio_utils.wav_to_base64", return_value="c3ludGhlc2l6ZWRfd2F2X2Jhc2U2NA=="), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):

            mock_stt = MagicMock()
            mock_stt.transcribe.return_value = mock_stt_result
            mock_stt.name = "sravaani"
            mock_get_stt.return_value = mock_stt

            mock_tts = MagicMock()
            mock_tts.synthesize.return_value = mock_tts_result
            mock_tts.name = "kokoro"
            mock_get_tts.return_value = mock_tts

            payload = {
                "audio_base64": "dGVzdF9hdWRpb19kYXRh",
                "language": "en",
                "user_id": "usr_test_999",
                "financial_context": {
                    "savings_rate_percentage": 25.0,
                },
            }

            resp = client.post(VOICE_CHAT_URL, json=payload)
            assert resp.status_code == 200
            body = resp.json()

            assert body["transcript"] == "What is my current monthly budget?"
            assert "answer" in body
            assert body["audio_base64"] == "c3ludGhlc2l6ZWRfd2F2X2Jhc2U2NA=="
            assert body["language"] == "en"
            assert body["stt"]["provider"] == "sravaani"
            assert body["tts"]["provider"] == "kokoro"
            assert body["timing"]["total_ms"] >= 0

    def test_voice_chat_with_text_payload(self):
        mock_tts_result = TTSResult(
            audio_path=Path("dummy.wav"),
            sample_rate=24000,
            provider="kokoro",
            voice="hf_alpha",
            latency_ms=28.0,
            audio_seconds=1.5,
        )

        with patch("backend.app.services.voice_service.tts_module.get_tts") as mock_get_tts, \
             patch("backend.app.services.voice_service.audio_utils.wav_to_base64", return_value="bW9ja190dHNfd2F2"), \
             patch("backend.app.services.voice_service.audio_utils.cleanup"):

            mock_tts = MagicMock()
            mock_tts.synthesize.return_value = mock_tts_result
            mock_tts.name = "kokoro"
            mock_get_tts.return_value = mock_tts

            payload = {
                "text": "नमस्ते धनमित्र",
                "language": "hi",
            }

            resp = client.post(VOICE_CHAT_URL, json=payload)
            assert resp.status_code == 200
            body = resp.json()

            assert body["transcript"] == "नमस्ते धनमित्र"
            assert body["audio_base64"] == "bW9ja190dHNfd2F2"
            assert body["language"] == "hi"

    def test_voice_chat_empty_body_returns_422(self):
        resp = client.post(VOICE_CHAT_URL, json={})
        assert resp.status_code == 422

    def test_voice_chat_audio_error_handled_gracefully(self):
        with patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", side_effect=AudioError("Corrupt audio")):
            payload = {"audio_base64": "corrupt_data", "language": "en"}
            resp = client.post(VOICE_CHAT_URL, json=payload)
            assert resp.status_code == 200
            assert "audio could not be decoded" in resp.json()["answer"].lower()

    def test_voice_chat_server_error_returns_500(self):
        with patch("backend.app.services.voice_service.audio_utils.decode_base64_audio", side_effect=RuntimeError("Unexpected fatal")):
            payload = {"audio_base64": "valid_data", "language": "en"}
            resp = client.post(VOICE_CHAT_URL, json=payload)
            assert resp.status_code == 500
            assert "failed to process" in resp.json()["detail"].lower()
