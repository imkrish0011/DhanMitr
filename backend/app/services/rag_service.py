"""RAG Retrieval and Grounded Answer Service for DhanMITR.

Queries the Supabase pgvector infrastructure via the rag.match_chunks() RPC,
routes real-time financial market queries (RBI, Metals, Forex, Crypto, Stocks),
and orchestrates grounded answer generation with Groq and speech-friendly summaries.
"""

import asyncio
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from supabase import Client, create_client

from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Add project root to sys.path so rag.scripts can be imported
ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

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
_sentence_transformer_model = None


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


def get_embedding_vector(text: str) -> Optional[List[float]]:
    """Encodes query text into a 1024-dimensional BGE-M3 float vector."""
    global _sentence_transformer_model
    try:
        if _sentence_transformer_model is None:
            from sentence_transformers import SentenceTransformer
            _sentence_transformer_model = SentenceTransformer("BAAI/bge-m3")
        vector = _sentence_transformer_model.encode(
            text, normalize_embeddings=True
        ).tolist()
        return vector
    except Exception as exc:
        logger.debug("SentenceTransformer encoding unavailable or failed: %s", exc)
        return None


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
    """
    _validate_embedding(query_embedding)
    _validate_match_count(match_count)
    _validate_threshold(match_threshold)

    client = _get_supabase_client()

    try:
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


# ---------------------------------------------------------------------------
# Grounded Answer Generation (RAG + Live Data + Groq + TTS Cleaning)
# ---------------------------------------------------------------------------

def _clean_speech_text(text: str) -> str:
    """Strip markdown headers, bullet stars, and citations for clean TTS playback."""
    clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    clean = re.sub(r"#{1,6}\s*", "", clean)
    clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", clean)
    clean = re.sub(r"[-*•]\s+", "", clean)
    clean = re.sub(r"\n{2,}", " ", clean)
    clean = re.sub(r"\s{2,}", " ", clean)
    return clean.strip()


def _format_live_data_text(live_data: Dict[str, Any]) -> str:
    """Format live market data dict into clean contextual string."""
    if not live_data:
        return "No live data available."
    lines = ["LIVE MARKET DATA:", "-----------------"]
    for k, v in live_data.items():
        if isinstance(v, dict):
            lines.append(f"{k}:")
            for sk, sv in v.items():
                lines.append(f"  {sk}: {sv}")
        else:
            lines.append(f"{k}: {v}")
    return "\n".join(lines)


async def generate_grounded_answer(
    question: str,
    financial_context: Optional[Any] = None,
    language: str = "en",
) -> Dict[str, Any]:
    """Orchestrates end-to-end grounded answer generation.

    1. Checks real-time live data router (RBI, Metals, Forex, Stocks, Crypto).
    2. Retrieves relevant RAG chunks from Supabase pgvector.
    3. If GROQ_API_KEY is configured, queries Groq (openai/gpt-oss-120b or llama-3.3-70b-versatile).
    4. Otherwise, formats structured grounded answer from verified sources & financial profile.
    5. Produces both rich markdown answer and speech-friendly TTS reply.
    """
    q = (question or "").strip()
    if not q:
        return {
            "question": "",
            "answer": "Please provide a question or topic.",
            "reply_text": "Please provide a question or topic.",
            "language": language,
            "sources": [],
            "live_data": None,
            "suggested_actions": [],
        }

    # Detect Hindi query
    is_hindi = (
        language == "hi"
        or any("\u0900" <= ch <= "\u097f" for ch in q)
        or any(w in q.lower() for w in ["योजना", "ब्याज", "दर", "सोना", "चांदी", "शेयर", "रुपया"])
    )
    effective_lang = "hi" if is_hindi else "en"

    # 1. Real-time Live Market Data
    live_data = None
    try:
        from rag.scripts.live_data.live_router import get_live_data
        live_data = await asyncio.to_thread(get_live_data, q)
    except Exception as exc:
        logger.debug("Live data router check failed: %s", exc)

    # 2. RAG Chunk Retrieval via Supabase
    retrieved_chunks: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    try:
        vector = await asyncio.to_thread(get_embedding_vector, q)
        if vector:
            retrieved_chunks = await search_similar_chunks(
                query_embedding=vector,
                match_count=4,
                match_threshold=0.35,
            )
            for c in retrieved_chunks:
                sources.append({
                    "title": c.get("document_title") or c.get("source_name") or "DhanMITR Knowledge",
                    "source_type": c.get("data_type") or "scheme",
                    "snippet": (c.get("chunk_text") or "")[:200] + "...",
                    "url": c.get("source_url") or "",
                    "similarity": c.get("similarity", 0.0),
                })
    except Exception as exc:
        logger.debug("RAG vector retrieval check skipped or failed: %s", exc)

    # 3. Call Groq if API Key is available
    groq_api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            from groq import Groq
            groq_client = Groq(api_key=groq_api_key)

            # Build contexts
            rag_context_text = "\n\n".join(
                f"Document: {c.get('document_title')}\nSource: {c.get('source_name')}\nContent: {c.get('chunk_text')}"
                for c in retrieved_chunks
            ) if retrieved_chunks else "No specific policy document matched."

            live_context_text = _format_live_data_text(live_data) if live_data else "No live-data matched."

            user_prompt = f"""You are DhanMITR, an expert personal finance and government scheme advisor in India.
Language: {effective_lang}

RAG KNOWLEDGE CONTEXT:
{rag_context_text}

LIVE MARKET DATA:
{live_context_text}

USER QUESTION:
{q}

Answer clearly, accurately, and concisely. Use bold headers and bullets where helpful. Mention currency (INR) and sources when applicable."""

            response = await asyncio.to_thread(
                lambda: groq_client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": "You are DhanMITR, a helpful and precise Indian financial assistant."},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.1,
                    max_tokens=600,
                )
            )
            generated_answer = response.choices[0].message.content or ""
            if generated_answer.strip():
                spoken_reply = _clean_speech_text(generated_answer)
                return {
                    "question": q,
                    "answer": generated_answer.strip(),
                    "reply_text": spoken_reply,
                    "language": effective_lang,
                    "sources": sources,
                    "live_data": live_data,
                    "suggested_actions": ["Ask another question", "Explore relevant schemes", "Check financial health"],
                }
        except Exception as exc:
            logger.warning("Groq generation failed, using structured fallback: %s", exc)

    # 4. Structured Fallback Generation (when Groq key is not provided or offline)
    if live_data:
        provider = live_data.get("provider")
        if provider == "rbi":
            rates = live_data.get("rates", {})
            answer_text = (
                f"**Current RBI Policy Rates (Live Data):**\n\n"
                f"- **Repo Rate:** {rates.get('repo_rate', 'N/A')}%\n"
                f"- **SDF Rate:** {rates.get('sdf_rate', 'N/A')}%\n"
                f"- **MSF Rate:** {rates.get('msf_rate', 'N/A')}%\n"
                f"- **Bank Rate:** {rates.get('bank_rate', 'N/A')}%\n"
                f"- **Reverse Repo Rate:** {rates.get('reverse_repo_rate', 'N/A')}%\n\n"
                f"*Source: Reserve Bank of India*"
            )
        elif provider == "coingecko":
            asset = live_data.get("asset", "Crypto")
            price = live_data.get("price", 0)
            change = live_data.get("change_24h", 0)
            answer_text = (
                f"**Current {asset} Price (CoinGecko Live):**\n\n"
                f"- **Price:** ₹{price:,.2f} INR\n"
                f"- **24h Change:** {change:+.2f}%\n"
            )
        elif provider == "yfinance":
            symbol = live_data.get("symbol", "Stock")
            price = live_data.get("price", 0)
            answer_text = f"**Current {symbol} Stock Price:** ₹{price:,.2f} INR (via Live NSE/BSE Feed)"
        else:
            answer_text = f"**Live Financial Data:**\n{_format_live_data_text(live_data)}"
    elif retrieved_chunks:
        top_chunk = retrieved_chunks[0]
        title = top_chunk.get("document_title") or "Financial Scheme Knowledge"
        text = top_chunk.get("chunk_text", "")
        answer_text = f"**{title}**\n\n{text}"
    else:
        from backend.app.services.temporary_response_service import (
            generate_temporary_financial_response,
        )
        answer_text, _, effective_lang = generate_temporary_financial_response(
            query=q,
            language_hint=effective_lang,
            context=financial_context,
        )

    spoken_reply = _clean_speech_text(answer_text)

    return {
        "question": q,
        "answer": answer_text,
        "reply_text": spoken_reply,
        "language": effective_lang,
        "sources": sources,
        "live_data": live_data,
        "suggested_actions": ["Analyze my spending", "Compare tax regimes", "Show investment tips"],
    }
