"""RAG retrieval and Q&A API endpoints for DhanMITR."""

import logging

from fastapi import APIRouter, HTTPException

from backend.app.schemas.rag import (
    KnowledgeSourceSchema,
    RAGAskRequest,
    RAGAskResponse,
    RAGChunkResult,
    RAGSearchRequest,
    RAGSearchResponse,
)
from backend.app.services import rag_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/search", response_model=RAGSearchResponse, summary="Vector similarity search over RAG chunks")
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


@router.post("/ask", response_model=RAGAskResponse, summary="Grounded Q&A via RAG + Live Data + Groq LLM")
async def ask_rag_question(request: RAGAskRequest) -> RAGAskResponse:
    """End-to-end grounded question answering for personal finance & government schemes.

    1. Routes real-time financial queries to live data providers (RBI, Forex, Metals, Stocks, Crypto).
    2. Performs vector retrieval across official government schemes and banking policy documents.
    3. Generates grounded answer via Groq LLM with citations and speech-friendly summaries.
    """
    try:
        result = await rag_service.generate_grounded_answer(
            question=request.question,
            financial_context=request.financial_context,
            language=request.language or "en",
        )
        return RAGAskResponse(
            question=result["question"],
            answer=result["answer"],
            reply_text=result["reply_text"],
            language=result["language"],
            sources=[KnowledgeSourceSchema(**s) for s in result.get("sources", [])],
            live_data=result.get("live_data"),
            suggested_actions=result.get("suggested_actions", []),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("RAG Q&A execution failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate RAG answer: {exc}",
        ) from exc
