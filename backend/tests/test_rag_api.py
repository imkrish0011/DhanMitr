"""Integration tests for the RAG retrieval API endpoint.

Uses FastAPI TestClient with a mocked Supabase client — no real
credentials or database connection required.
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Ensure project root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.main import app
from backend.app.services.rag_service import EMBEDDING_DIM, reset_client

client = TestClient(app)

RAG_SEARCH_URL = "/api/v1/rag/search"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_embedding(dim: int = EMBEDDING_DIM, value: float = 0.1) -> list[float]:
    return [value] * dim


def _mock_rpc_response(data: list[dict] | None = None):
    resp = MagicMock()
    resp.data = data if data is not None else []
    return resp


def _build_mock_client(data: list[dict] | None = None, error: Exception | None = None):
    """Build a mock Supabase client that returns *data* or raises *error*."""
    mock_client = MagicMock()
    mock_schema = MagicMock()
    mock_rpc = MagicMock()

    if error:
        mock_rpc.execute.side_effect = error
    else:
        mock_rpc.execute.return_value = _mock_rpc_response(data)

    mock_schema.rpc.return_value = mock_rpc
    mock_client.schema.return_value = mock_schema
    return mock_client


@pytest.fixture(autouse=True)
def _reset_client():
    reset_client()
    yield
    reset_client()


# ---------------------------------------------------------------------------
# Existing endpoints are untouched
# ---------------------------------------------------------------------------

class TestExistingEndpoints:
    def test_health(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

    def test_root(self):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "Welcome" in resp.json()["message"]


# ---------------------------------------------------------------------------
# POST /api/v1/rag/search
# ---------------------------------------------------------------------------

class TestRAGSearchEndpoint:
    def test_valid_request_with_results(self):
        mock_data = [
            {
                "id": "c1",
                "document_id": "d1",
                "chunk_id": "ck1",
                "chunk_text": "Investment tips",
                "source_name": "RBI",
                "source_url": "https://rbi.org",
                "document_title": "RBI Guide",
                "data_type": "guide",
                "metadata": {"section": "intro"},
                "similarity": 0.91,
            }
        ]
        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=_build_mock_client(mock_data),
        ):
            resp = client.post(
                RAG_SEARCH_URL,
                json={
                    "query_embedding": _make_embedding(),
                    "match_count": 5,
                    "match_threshold": 0.0,
                },
            )

        assert resp.status_code == 200
        body = resp.json()
        assert len(body["results"]) == 1
        assert body["results"][0]["chunk_text"] == "Investment tips"
        assert body["results"][0]["similarity"] == 0.91

    def test_valid_request_empty_results(self):
        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=_build_mock_client([]),
        ):
            resp = client.post(
                RAG_SEARCH_URL,
                json={"query_embedding": _make_embedding()},
            )

        assert resp.status_code == 200
        assert resp.json() == {"results": []}

    def test_invalid_embedding_too_short(self):
        resp = client.post(
            RAG_SEARCH_URL,
            json={"query_embedding": _make_embedding(1023)},
        )
        assert resp.status_code == 422

    def test_invalid_embedding_too_long(self):
        resp = client.post(
            RAG_SEARCH_URL,
            json={"query_embedding": _make_embedding(1025)},
        )
        assert resp.status_code == 422

    def test_invalid_match_count_zero(self):
        resp = client.post(
            RAG_SEARCH_URL,
            json={"query_embedding": _make_embedding(), "match_count": 0},
        )
        assert resp.status_code == 422

    def test_invalid_match_count_too_large(self):
        resp = client.post(
            RAG_SEARCH_URL,
            json={"query_embedding": _make_embedding(), "match_count": 21},
        )
        assert resp.status_code == 422

    def test_invalid_threshold_negative(self):
        resp = client.post(
            RAG_SEARCH_URL,
            json={"query_embedding": _make_embedding(), "match_threshold": -0.1},
        )
        assert resp.status_code == 422

    def test_invalid_threshold_above_one(self):
        resp = client.post(
            RAG_SEARCH_URL,
            json={"query_embedding": _make_embedding(), "match_threshold": 1.5},
        )
        assert resp.status_code == 422

    def test_supabase_failure_returns_503(self):
        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=_build_mock_client(error=Exception("timeout")),
        ):
            resp = client.post(
                RAG_SEARCH_URL,
                json={"query_embedding": _make_embedding()},
            )

        assert resp.status_code == 503
        assert "unavailable" in resp.json()["detail"].lower()

    def test_missing_embedding_field(self):
        resp = client.post(RAG_SEARCH_URL, json={})
        assert resp.status_code == 422

    def test_defaults_applied(self):
        """match_count=5 and match_threshold=0.0 when omitted."""
        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=_build_mock_client([]),
        ):
            resp = client.post(
                RAG_SEARCH_URL,
                json={"query_embedding": _make_embedding()},
            )

        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# POST /api/v1/rag/ask
# ---------------------------------------------------------------------------

class TestRAGAskEndpoint:
    def test_ask_empty_body_returns_422(self):
        resp = client.post("/api/v1/rag/ask", json={})
        assert resp.status_code == 422

    def test_ask_valid_question_with_fallback(self):
        resp = client.post(
            "/api/v1/rag/ask",
            json={"question": "What is the 50/30/20 budget rule?", "language": "en"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["question"] == "What is the 50/30/20 budget rule?"
        assert len(data["answer"]) > 0
        assert "reply_text" in data
        assert isinstance(data["sources"], list)

    def test_ask_live_data_rbi_query(self):
        resp = client.post(
            "/api/v1/rag/ask",
            json={"question": "What is the current repo rate?", "language": "en"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["question"] == "What is the current repo rate?"
        assert "repo" in data["answer"].lower() or "rate" in data["answer"].lower()

    def test_ask_hindi_query(self):
        resp = client.post(
            "/api/v1/rag/ask",
            json={"question": "PMJJBY योजना क्या है?", "language": "hi"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["language"] == "hi"
        assert len(data["answer"]) > 0

