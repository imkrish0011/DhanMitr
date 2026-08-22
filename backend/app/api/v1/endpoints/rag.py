"""RAG retrieval API endpoints for DhanMITR."""

import logging

from fastapi import APIRouter, HTTPException

from backend.app.schemas.rag import (
    RAGChunkResult,
    RAGSearchRequest,
    RAGSearchResponse,
)
from backend.app.services import rag_service

logger = logging.getLogger(__name__)

router = APIRouter()


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
