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

def sanitize_plain_text(text: str) -> str:
    """Strip ALL markdown formatting to produce clean, readable plain text.

    Removes: headers (#), bold (**), italic (*/_), links [t](u), code blocks,
    bullet markers (- * •), backslashes, underscores used as emphasis, and
    excessive whitespace.  The result is natural conversational text suitable
    for both UI display and TTS playback.
    """
    if not text:
        return text
    # 1. Remove code fences (```...```)
    clean = re.sub(r"```[^`]*```", "", text, flags=re.DOTALL)
    # 2. Remove inline code backticks
    clean = re.sub(r"`([^`]+)`", r"\1", clean)
    # 3. Remove markdown headings (# Heading)
    clean = re.sub(r"#{1,6}\s*", "", clean)
    # 4. Remove bold/italic markers (***text***, **text**, *text*)
    clean = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", clean)
    # 5. Remove underscore emphasis (__text__ or _text_)
    clean = re.sub(r"_{1,2}([^_]+)_{1,2}", r"\1", clean)
    # 6. Convert markdown links [Title](url) -> Title
    clean = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", clean)
    # 7. Remove bullet/dash/star line starters
    clean = re.sub(r"^\s*[-*•]\s+", "", clean, flags=re.MULTILINE)
    # 8. Remove stray backslashes
    clean = re.sub(r"\\+", " ", clean)
    # 9. Remove stray forward-slash sequences (///  //)
    clean = re.sub(r"/{2,}", " ", clean)
    # 10. Collapse multiple newlines to double
    clean = re.sub(r"\n{3,}", "\n\n", clean)
    # 11. Collapse multiple spaces
    clean = re.sub(r"[ \t]{2,}", " ", clean)
    # 12. Strip leading/trailing whitespace per line
    clean = "\n".join(line.strip() for line in clean.split("\n"))
    return clean.strip()


# Keep legacy alias for any callers of _clean_speech_text
_clean_speech_text = sanitize_plain_text


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


# ---------------------------------------------------------------------------
# Personal Finance Intent Detection & Context Formatting
# ---------------------------------------------------------------------------

# Keywords that signal the user is asking about their OWN finances,
# subscriptions, spending, budget, or personal situation.
_PERSONAL_INTENT_KEYWORDS_EN = {
    "my", "i ", "i'm", "me", "mine",
    "subscription", "subscriptions", "ott", "netflix", "spotify",
    "prime", "hotstar", "disney", "youtube premium", "zee5", "jiocinema",
    "expense", "expenses", "spending", "spend", "budget", "afford",
    "savings", "saving", "salary", "income", "outflow",
    "insurance", "premium", "emi", "loan", "debt",
    "investment", "invested", "portfolio",
    "cut cost", "reduce expense", "save more", "overspending",
    "financial health", "net worth",
}
_PERSONAL_INTENT_KEYWORDS_HI = {
    "मेरा", "मेरी", "मेरे", "मुझे", "मैं",
    "खर्च", "खर्चा", "बचत", "बजट", "तनख्वाह", "आय",
    "सब्सक्रिप्शन", "बीमा", "प्रीमियम", "किस्त", "लोन", "कर्ज",
    "निवेश", "पोर्टफोलियो",
}


def detect_personal_finance_intent(question: str) -> bool:
    """Return True if the user question relates to their personal finances.

    Uses keyword matching on both English and Hindi terms. Only returns True
    when the query clearly indicates the user wants information about their
    own money, subscriptions, spending habits, budget, etc.
    """
    q_lower = question.lower()
    for keyword in _PERSONAL_INTENT_KEYWORDS_EN:
        if keyword in q_lower:
            return True
    for keyword in _PERSONAL_INTENT_KEYWORDS_HI:
        if keyword in question:
            return True
    return False


def format_user_financial_context(ctx: Any) -> str:
    """Format a FinancialContext (or dict) into a plain-text snapshot for the LLM.

    The snapshot is injected into the prompt under the section
    'USER PERSONAL FINANCIAL SNAPSHOT' only when personal intent is detected.
    """
    if ctx is None:
        return ""

    # Accept both dict and pydantic model
    if hasattr(ctx, "model_dump"):
        d = ctx.model_dump()
    elif isinstance(ctx, dict):
        d = ctx
    else:
        return ""

    lines: List[str] = ["USER PERSONAL FINANCIAL SNAPSHOT:"]

    # Profile summary
    profile = d.get("profile") or {}
    income = profile.get("monthly_income", 0)
    expenses = profile.get("monthly_expenses", 0)
    net_surplus = d.get("net_surplus", income - expenses)
    savings_rate = d.get("savings_rate_percentage", 0)
    net_worth = d.get("net_worth", 0)

    if income or expenses:
        lines.append(
            f"Monthly Income: Rs.{income:,.0f} | Monthly Expenses: Rs.{expenses:,.0f} | "
            f"Net Surplus: Rs.{net_surplus:,.0f} ({savings_rate:.1f}% savings rate)"
        )
    if net_worth:
        lines.append(f"Estimated Net Worth: Rs.{net_worth:,.0f}")

    # Active subscriptions total
    subs_total = d.get("active_subscriptions_total", 0)
    if subs_total:
        lines.append(f"Active Subscriptions Total: Rs.{subs_total:,.0f}/month")

    # Insurance coverages
    coverages = d.get("active_insurance_coverages") or []
    if coverages:
        lines.append(f"Active Insurance Policies: {', '.join(coverages)}")

    # Top spending categories
    categories = d.get("top_spending_categories") or []
    if categories:
        lines.append("Top Spending Categories:")
        for cat in categories[:6]:
            name = cat.get("category", "Other") if isinstance(cat, dict) else getattr(cat, "category", "Other")
            amt = cat.get("amount", 0) if isinstance(cat, dict) else getattr(cat, "amount", 0)
            pct = cat.get("percentage", 0) if isinstance(cat, dict) else getattr(cat, "percentage", 0)
            lines.append(f"  {name}: Rs.{amt:,.0f} ({pct:.0f}%)")

    # Risk tolerance & employment
    risk = profile.get("risk_tolerance", "")
    emp = profile.get("employment_type", "")
    if risk or emp:
        parts = []
        if risk:
            parts.append(f"Risk Tolerance: {risk}")
        if emp:
            parts.append(f"Employment: {emp}")
        lines.append(" | ".join(parts))

    return "\n".join(lines) if len(lines) > 1 else ""


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

    # 3. Conditional Personal Finance Context Injection
    is_personal = detect_personal_finance_intent(q)
    user_context_text = ""
    if is_personal and financial_context:
        user_context_text = format_user_financial_context(financial_context)
        if user_context_text:
            logger.debug("Personal finance intent detected — attaching user financial snapshot.")

    # 4. Load system prompt from file
    _system_prompt_path = ROOT_DIR / "rag" / "scripts" / "prompts" / "system_prompt.txt"
    try:
        system_prompt_text = _system_prompt_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        system_prompt_text = (
            "You are DhanMITR, a helpful and precise Indian financial assistant. "
            "Always respond in plain conversational text. Do NOT use any Markdown formatting."
        )

    # 5. Call Groq if API Key is available
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

            # Build user prompt with conditional personal context
            user_prompt_parts = [
                f"Language: {effective_lang}",
                "",
                "RAG KNOWLEDGE CONTEXT:",
                rag_context_text,
                "",
                "LIVE MARKET DATA:",
                live_context_text,
            ]

            # Only inject personal finances when intent is detected
            if user_context_text:
                user_prompt_parts.extend(["", user_context_text])

            user_prompt_parts.extend([
                "",
                "USER QUESTION:",
                q,
                "",
                "Answer clearly, accurately, and concisely in plain conversational text. "
                "Do NOT use any Markdown formatting such as hashtags, asterisks, bold markers, bullet dashes, or backslashes. "
                "Use plain numbered lists (1. 2. 3.) when listing items. "
                "Mention currency (INR/Rs.) and sources when applicable.",
            ])

            user_prompt = "\n".join(user_prompt_parts)

            response = await asyncio.to_thread(
                lambda: groq_client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt_text},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.1,
                    max_tokens=600,
                )
            )
            generated_answer = response.choices[0].message.content or ""
            if generated_answer.strip():
                clean_answer = sanitize_plain_text(generated_answer)
                spoken_reply = sanitize_plain_text(generated_answer)
                return {
                    "question": q,
                    "answer": clean_answer,
                    "reply_text": spoken_reply,
                    "language": effective_lang,
                    "sources": sources,
                    "live_data": live_data,
                    "suggested_actions": ["Ask another question", "Explore relevant schemes", "Check financial health"],
                }
        except Exception as exc:
            logger.warning("Groq generation failed, using structured fallback: %s", exc)

    # 6. Structured Fallback Generation (when Groq key is not provided or offline)
    if live_data:
        provider = live_data.get("provider")
        if provider == "rbi":
            rates = live_data.get("rates", {})
            answer_text = (
                f"Current RBI Policy Rates (Live Data):\n\n"
                f"1. Repo Rate: {rates.get('repo_rate', 'N/A')}%\n"
                f"2. SDF Rate: {rates.get('sdf_rate', 'N/A')}%\n"
                f"3. MSF Rate: {rates.get('msf_rate', 'N/A')}%\n"
                f"4. Bank Rate: {rates.get('bank_rate', 'N/A')}%\n"
                f"5. Reverse Repo Rate: {rates.get('reverse_repo_rate', 'N/A')}%\n\n"
                f"Source: Reserve Bank of India"
            )
        elif provider == "coingecko":
            asset = live_data.get("asset", "Crypto")
            price = live_data.get("price", 0)
            change = live_data.get("change_24h", 0)
            answer_text = (
                f"Current {asset} Price (CoinGecko Live):\n\n"
                f"Price: Rs.{price:,.2f} INR\n"
                f"24h Change: {change:+.2f}%"
            )
        elif provider == "yfinance":
            symbol = live_data.get("symbol", "Stock")
            price = live_data.get("price", 0)
            answer_text = f"Current {symbol} Stock Price: Rs.{price:,.2f} INR (via Live NSE/BSE Feed)"
        else:
            answer_text = f"Live Financial Data:\n{_format_live_data_text(live_data)}"
    elif retrieved_chunks:
        top_chunk = retrieved_chunks[0]
        title = top_chunk.get("document_title") or "Financial Scheme Knowledge"
        text = top_chunk.get("chunk_text", "")
        answer_text = f"{title}\n\n{text}"
    else:
        from backend.app.services.temporary_response_service import (
            generate_temporary_financial_response,
        )
        answer_text, _, effective_lang = generate_temporary_financial_response(
            query=q,
            language_hint=effective_lang,
            context=financial_context,
        )

    # Sanitize all output
    answer_text = sanitize_plain_text(answer_text)
    spoken_reply = sanitize_plain_text(answer_text)

    return {
        "question": q,
        "answer": answer_text,
        "reply_text": spoken_reply,
        "language": effective_lang,
        "sources": sources,
        "live_data": live_data,
        "suggested_actions": ["Analyze my spending", "Compare tax regimes", "Show investment tips"],
    }
