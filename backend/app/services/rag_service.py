"""RAG Retrieval Service for DhanMITR.

Queries the existing Supabase pgvector infrastructure via the
rag.match_chunks() RPC function. Does NOT generate embeddings —
that pipeline is handled separately.
"""

import asyncio
import logging
from typing import Any

from supabase import create_client, Client

from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Embedding dimension expected by the BGE-M3 model / rag.chunks table
# ---------------------------------------------------------------------------
EMBEDDING_DIM = 1024
MATCH_COUNT_MIN = 1
MATCH_COUNT_MAX = 20


class RAGServiceError(Exception):
    """Raised when the RAG retrieval service encounters an error."""


# ---------------------------------------------------------------------------
# Supabase client (lazy singleton)
# ---------------------------------------------------------------------------
_supabase_client: Client | None = None


def _get_supabase_client() -> Client:
    """Return a lazily-initialised Supabase client using the service-role key."""
    global _supabase_client
    if _supabase_client is None:
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_KEY
        if not url or not key:
            raise RAGServiceError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. "
                "Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
                "environment variables."
            )
        _supabase_client = create_client(url, key)
    return _supabase_client


def reset_client() -> None:
    """Reset the cached client (useful for testing)."""
    global _supabase_client
    _supabase_client = None


# ---------------------------------------------------------------------------
# Input validation helpers
# ---------------------------------------------------------------------------

def _validate_embedding(query_embedding: list[float]) -> None:
    if len(query_embedding) != EMBEDDING_DIM:
        raise ValueError(
            f"query_embedding must have exactly {EMBEDDING_DIM} dimensions, "
            f"got {len(query_embedding)}"
        )


def _validate_match_count(match_count: int) -> None:
    if not (MATCH_COUNT_MIN <= match_count <= MATCH_COUNT_MAX):
        raise ValueError(
            f"match_count must be between {MATCH_COUNT_MIN} and "
            f"{MATCH_COUNT_MAX}, got {match_count}"
        )


def _validate_threshold(match_threshold: float) -> None:
    if not (0.0 <= match_threshold <= 1.0):
        raise ValueError(
            f"match_threshold must be between 0.0 and 1.0, "
            f"got {match_threshold}"
        )


# ---------------------------------------------------------------------------
# Normalise a single row returned by the RPC
# ---------------------------------------------------------------------------

def _normalise_chunk(row: dict[str, Any]) -> dict[str, Any]:
    """Map a raw Supabase RPC row to a clean response dict."""
    return {
        "id": row.get("id"),
        "document_id": row.get("document_id"),
        "chunk_id": row.get("chunk_id"),
        "chunk_text": row.get("chunk_text", ""),
        "source_name": row.get("source_name", ""),
        "source_url": row.get("source_url", ""),
        "document_title": row.get("document_title", ""),
        "data_type": row.get("data_type", ""),
        "metadata": row.get("metadata") or {},
        "similarity": row.get("similarity", 0.0),
    }


# ---------------------------------------------------------------------------
# Public retrieval function
# ---------------------------------------------------------------------------

def _execute_match_chunks(
    client: Client,
    query_embedding: list[float],
    match_threshold: float,
    match_count: int,
):
    """Run the (synchronous) Supabase RPC call. Executed in a worker thread."""
    # The RPC function lives in the 'rag' schema.
    # Supabase-py supports schema switching via .schema().
    return (
        client
        .schema("rag")
        .rpc(
            "match_chunks",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
            },
        )
        .execute()
    )


async def search_similar_chunks(
    query_embedding: list[float],
    match_count: int = 5,
    match_threshold: float = 0.0,
) -> list[dict[str, Any]]:
    """Search for RAG chunks similar to *query_embedding*.

    Parameters
    ----------
    query_embedding:
        A 1024-dimensional float vector (BGE-M3 embedding).
    match_count:
        Maximum number of results to return (1–20).
    match_threshold:
        Minimum cosine-similarity score (0.0–1.0).

    Returns
    -------
    list[dict]
        Normalised chunk results ordered by descending similarity.

    Raises
    ------
    ValueError
        If any input parameter is invalid.
    RAGServiceError
        If the Supabase RPC call fails.
    """
    # Validate inputs
    _validate_embedding(query_embedding)
    _validate_match_count(match_count)
    _validate_threshold(match_threshold)

    client = _get_supabase_client()

    try:
        # supabase-py is synchronous — offload to a thread so the
        # event loop is not blocked during the network round-trip.
        response = await asyncio.to_thread(
            _execute_match_chunks,
            client,
            query_embedding,
            match_threshold,
            match_count,
        )
    except Exception as exc:
        logger.error("Supabase RPC match_chunks failed: %s", exc)
        raise RAGServiceError(f"Failed to query RAG chunks: {exc}") from exc

    rows = response.data if response.data else []
    return [_normalise_chunk(row) for row in rows]
