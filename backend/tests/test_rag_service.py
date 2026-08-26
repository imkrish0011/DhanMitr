"""Unit tests for the RAG retrieval service.

All tests mock the Supabase client — no real credentials needed.
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# Ensure project root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.services.rag_service import (
    EMBEDDING_DIM,
    RAGServiceError,
    _normalise_chunk,
    _validate_embedding,
    _validate_match_count,
    _validate_threshold,
    reset_client,
    search_similar_chunks,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_embedding(dim: int = EMBEDDING_DIM, value: float = 0.1) -> list[float]:
    """Create a dummy embedding vector of the given dimension."""
    return [value] * dim


def _mock_rpc_response(data: list[dict] | None = None):
    """Return a mock Supabase RPC response object."""
    resp = MagicMock()
    resp.data = data if data is not None else []
    return resp


# ---------------------------------------------------------------------------
# Validation: embedding dimension
# ---------------------------------------------------------------------------

class TestValidateEmbedding:
    def test_valid_1024(self):
        _validate_embedding(_make_embedding(1024))

    def test_too_short_1023(self):
        with pytest.raises(ValueError, match="1024 dimensions"):
            _validate_embedding(_make_embedding(1023))

    def test_too_long_1025(self):
        with pytest.raises(ValueError, match="1024 dimensions"):
            _validate_embedding(_make_embedding(1025))

    def test_empty(self):
        with pytest.raises(ValueError, match="1024 dimensions"):
            _validate_embedding([])


# ---------------------------------------------------------------------------
# Validation: match_count
# ---------------------------------------------------------------------------

class TestValidateMatchCount:
    def test_valid_boundaries(self):
        _validate_match_count(1)
        _validate_match_count(10)
        _validate_match_count(20)

    def test_zero(self):
        with pytest.raises(ValueError, match="match_count"):
            _validate_match_count(0)

    def test_negative(self):
        with pytest.raises(ValueError, match="match_count"):
            _validate_match_count(-1)

    def test_too_large(self):
        with pytest.raises(ValueError, match="match_count"):
            _validate_match_count(21)


# ---------------------------------------------------------------------------
# Validation: match_threshold
# ---------------------------------------------------------------------------

class TestValidateThreshold:
    def test_valid_boundaries(self):
        _validate_threshold(0.0)
        _validate_threshold(0.5)
        _validate_threshold(1.0)

    def test_negative(self):
        with pytest.raises(ValueError, match="match_threshold"):
            _validate_threshold(-0.1)

    def test_above_one(self):
        with pytest.raises(ValueError, match="match_threshold"):
            _validate_threshold(1.5)


# ---------------------------------------------------------------------------
# Normalisation
# ---------------------------------------------------------------------------

class TestNormaliseChunk:
    def test_full_row(self):
        row = {
            "id": "abc-123",
            "document_id": "doc-1",
            "chunk_id": "chunk-1",
            "chunk_text": "some text",
            "source_name": "RBI FAQ",
            "source_url": "https://example.com",
            "document_title": "RBI FAQ 2024",
            "data_type": "faq",
            "metadata": {"page": 3},
            "similarity": 0.92,
        }
        result = _normalise_chunk(row)
        assert result["id"] == "abc-123"
        assert result["similarity"] == 0.92
        assert result["metadata"] == {"page": 3}

    def test_missing_fields_default(self):
        result = _normalise_chunk({})
        assert result["id"] is None
        assert result["chunk_text"] == ""
        assert result["metadata"] == {}
        assert result["similarity"] == 0.0


# ---------------------------------------------------------------------------
# search_similar_chunks – happy path
# ---------------------------------------------------------------------------

class TestSearchSimilarChunks:
    """Test the main retrieval function with a mocked Supabase client."""

    @pytest.fixture(autouse=True)
    def _reset(self):
        """Reset the cached client before each test."""
        reset_client()
        yield
        reset_client()

    @pytest.mark.asyncio
    async def test_successful_response(self):
        mock_data = [
            {
                "id": "c1",
                "document_id": "d1",
                "chunk_id": "ck1",
                "chunk_text": "hello",
                "source_name": "src",
                "source_url": "https://x.com",
                "document_title": "Title",
                "data_type": "article",
                "metadata": {},
                "similarity": 0.87,
            }
        ]

        mock_client = MagicMock()
        mock_schema = MagicMock()
        mock_rpc = MagicMock()
        mock_rpc.execute.return_value = _mock_rpc_response(mock_data)
        mock_schema.rpc.return_value = mock_rpc
        mock_client.schema.return_value = mock_schema

        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=mock_client,
        ):
            results = await search_similar_chunks(
                query_embedding=_make_embedding(),
                match_count=5,
                match_threshold=0.0,
            )

        assert len(results) == 1
        assert results[0]["chunk_text"] == "hello"
        assert results[0]["similarity"] == 0.87

        # Verify the RPC was called with correct params
        mock_schema.rpc.assert_called_once_with(
            "match_chunks",
            {
                "query_embedding": _make_embedding(),
                "match_threshold": 0.0,
                "match_count": 5,
            },
        )

    @pytest.mark.asyncio
    async def test_empty_result(self):
        mock_client = MagicMock()
        mock_schema = MagicMock()
        mock_rpc = MagicMock()
        mock_rpc.execute.return_value = _mock_rpc_response([])
        mock_schema.rpc.return_value = mock_rpc
        mock_client.schema.return_value = mock_schema

        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=mock_client,
        ):
            results = await search_similar_chunks(
                query_embedding=_make_embedding(),
            )

        assert results == []

    @pytest.mark.asyncio
    async def test_none_data_treated_as_empty(self):
        mock_client = MagicMock()
        mock_schema = MagicMock()
        mock_rpc = MagicMock()
        mock_rpc.execute.return_value = _mock_rpc_response(None)
        mock_schema.rpc.return_value = mock_rpc
        mock_client.schema.return_value = mock_schema

        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=mock_client,
        ):
            results = await search_similar_chunks(
                query_embedding=_make_embedding(),
            )

        assert results == []

    @pytest.mark.asyncio
    async def test_supabase_rpc_failure(self):
        mock_client = MagicMock()
        mock_schema = MagicMock()
        mock_rpc = MagicMock()
        mock_rpc.execute.side_effect = Exception("connection refused")
        mock_schema.rpc.return_value = mock_rpc
        mock_client.schema.return_value = mock_schema

        with patch(
            "backend.app.services.rag_service._get_supabase_client",
            return_value=mock_client,
        ):
            with pytest.raises(RAGServiceError, match="Failed to query"):
                await search_similar_chunks(
                    query_embedding=_make_embedding(),
                )

    @pytest.mark.asyncio
    async def test_invalid_embedding_raises_value_error(self):
        with pytest.raises(ValueError, match="1024 dimensions"):
            await search_similar_chunks(
                query_embedding=_make_embedding(512),
            )

    @pytest.mark.asyncio
    async def test_invalid_match_count_raises_value_error(self):
        with pytest.raises(ValueError, match="match_count"):
            await search_similar_chunks(
                query_embedding=_make_embedding(),
                match_count=0,
            )

    @pytest.mark.asyncio
    async def test_invalid_threshold_raises_value_error(self):
        with pytest.raises(ValueError, match="match_threshold"):
            await search_similar_chunks(
                query_embedding=_make_embedding(),
                match_threshold=1.5,
            )


# ---------------------------------------------------------------------------
# Tavily Fallback & Web Search
# ---------------------------------------------------------------------------

class TestTavilyWebSearch:
    def test_search_tavily_fallback_success(self):
        from backend.app.services.rag_service import _search_tavily_fallback, _format_web_sources

        mock_results = [
            {"title": "Test Title", "url": "https://example.com", "content": "Sample content about finance"}
        ]
        with patch("backend.app.services.rag_service.search_web", return_value=mock_results):
            results, context = _search_tavily_fallback("test query")
            assert len(results) == 1
            assert results[0]["title"] == "Test Title"
            assert "Sample content about finance" in context

            sources = _format_web_sources(results)
            assert len(sources) == 1
            assert sources[0]["source_type"] == "web"
            assert sources[0]["url"] == "https://example.com"

    def test_search_tavily_fallback_failure(self):
        from backend.app.services.rag_service import _search_tavily_fallback

        with patch("backend.app.services.rag_service.search_web", side_effect=Exception("API error")):
            results, context = _search_tavily_fallback("test query")
            assert results == []
            assert context == ""

