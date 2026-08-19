"""RAG retrieval API routes for DhanMITR."""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.app.services import rag_service

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class RAGSearchRequest(BaseModel):
    """Request body for the RAG similarity-search endpoint."""

    query_embedding: list[float] = Field(
        ...,
        description="A 1024-dimensional BGE-M3 embedding vector.",
    )
    match_count: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of results to return (1–20).",
    )
    match_threshold: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Minimum cosine-similarity score (0.0–1.0).",
    )

    @field_validator("query_embedding")
    @classmethod
    def validate_embedding_length(cls, v: list[float]) -> list[float]:
        if len(v) != rag_service.EMBEDDING_DIM:
            raise ValueError(
                f"query_embedding must have exactly {rag_service.EMBEDDING_DIM} "
                f"dimensions, got {len(v)}"
            )
        return v


class RAGChunkResult(BaseModel):
    """A single chunk returned from the RAG similarity search."""

    id: Any = None
    document_id: Any = None
    chunk_id: Any = None
    chunk_text: str = ""
    source_name: str = ""
    source_url: str = ""
    document_title: str = ""
    data_type: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    similarity: float = 0.0


class RAGSearchResponse(BaseModel):
    """Response wrapper for the RAG similarity-search endpoint."""

    results: list[RAGChunkResult]


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post("/search", response_model=RAGSearchResponse)
async def search_rag_chunks(request: RAGSearchRequest) -> RAGSearchResponse:
    """Search for RAG chunks similar to the supplied embedding vector.

    Expects a 1024-dimensional BGE-M3 embedding. Retrieval is performed
    server-side by the Supabase ``rag.match_chunks()`` RPC using pgvector
    HNSW indexing.

    Returns an empty ``results`` list when no chunks match — this is a
    valid success response (the RAG database may not yet contain data).
    """
    try:
        chunks = await rag_service.search_similar_chunks(
            query_embedding=request.query_embedding,
            match_count=request.match_count,
            match_threshold=request.match_threshold,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except rag_service.RAGServiceError as exc:
        logger.error("RAG search failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="RAG retrieval service is temporarily unavailable.",
        ) from exc

    return RAGSearchResponse(
        results=[RAGChunkResult(**chunk) for chunk in chunks],
    )
