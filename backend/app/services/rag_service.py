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
import time
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


def warmup_rag_model() -> None:
    """Pre-loads the BGE-M3 embedding model in background during startup."""
    global _sentence_transformer_model
    try:
        logger.info("Pre-warming BGE-M3 SentenceTransformer model...")
        if _sentence_transformer_model is None:
            from sentence_transformers import SentenceTransformer
            _sentence_transformer_model = SentenceTransformer("BAAI/bge-m3")
        _sentence_transformer_model.encode("DhanMITR warmup query", normalize_embeddings=True)
        logger.info("BGE-M3 SentenceTransformer model successfully pre-warmed.")
    except Exception as exc:
        logger.warning("BGE-M3 pre-warm failed or skipped: %s", exc)


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
        logger.warning("SentenceTransformer encoding failed: %s", exc)
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
        logger.warning("Supabase RPC match_chunks transient failure, resetting client and retrying: %s", exc)
        reset_client()
        try:
            client = _get_supabase_client()
            response = await asyncio.to_thread(
                _execute_match_chunks,
                client,
                query_embedding,
                match_threshold,
                match_count,
            )
        except Exception as retry_exc:
            logger.error("Supabase RPC match_chunks retry failed: %s", retry_exc)
            raise RAGServiceError(f"Failed to query RAG chunks: {retry_exc}") from retry_exc

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

# Precise regex patterns that detect when a user is referring to THEIR OWN money,
# budget, personal spending, OTT subscriptions, or financial situation.
# Uses word boundaries (\b) to completely prevent false positives on general queries
# (e.g., "tell me about gold", "home prices", "scheme", "prime rate").
_PERSONAL_INTENT_REGEX_PATTERNS = [
    # English possessive financial context
    r"\bmy\s+(?:spending|expenses?|budget|subscriptions?|salary|income|savings?|portfolio|investments?|loans?|emis?|insurance|coverages?|net\s*worth|bills?|money|account|cards?|finances?|cashflow|emergency\s*fund|ott|netflix|spotify|prime|hotstar|rent)\b",
    r"\b(?:what|show|check|tell)\s+(?:are|is|me)\s+my\b",
    r"\bhow\s+much\s+(?:did\s+i\s+spend|am\s+i\s+spending|do\s+i\s+(?:spend|save|earn|have|owe|pay))\b",
    r"\b(?:how\s+much\s+am\s+i\s+paying\s+for|what\s+is\s+my\s+active)\b",
    r"\b(?:can|could|should)\s+i\s+afford\b",
    r"\bwhere\s+(?:is\s+my\s+money\s+going|can\s+i\s+(?:cut|reduce|save)\s+(?:more|costs?|expenses?))\b",
    r"\b(?:my\s+)(?:ott|netflix|spotify|hotstar|amazon\s*prime|disney|zee5|jiocinema|youtube\s*premium)\b",
    r"\b(?:cut\s+my\s+expenses|reduce\s+my\s+costs?|my\s+financial\s+(?:health|summary|overview|status|snapshot))\b",

    # Hindi possessive / personal patterns
    r"\b(?:मेरा|मेरी|मेरे|मुझको|मुझे)\s+(?:खर्च|खर्चा|बचत|बजट|वेतन|सैलरी|आय|सब्सक्रिप्शन|बीमा|किस्त|ईएमआई|लोन|कर्ज|पैसे|खाता|इन्वेस्टमेंट|पोर्टफोलियो|नेटवर्थ|इमरजेंसी\s*फंड|रुपये)\b",
    r"\b(?:मैं|हम)\s+(?:कितना\s+(?:बचा|खर्च|कमा)|क्या\s+(?:खरीद|अफोर्ड)\s+सकता)\b",
    r"\bमेरी\s+वित्तीय\s+स्थिति\b",
]

_COMPILED_PERSONAL_PATTERNS = [
    re.compile(pattern, re.IGNORECASE) for pattern in _PERSONAL_INTENT_REGEX_PATTERNS
]


def detect_personal_finance_intent(question: str) -> bool:
    """Return True ONLY if the user question explicitly refers to their personal finances.

    Uses strict word-boundary regex patterns to avoid false positives on general
    market or educational queries (e.g., 'housing prices', 'gold rate', 'PMJJBY').
    """
    if not question:
        return False
    q_str = question.strip()
    return any(p.search(q_str) is not None for p in _COMPILED_PERSONAL_PATTERNS)



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


from backend.app.core.language_detector import detect_language

async def generate_grounded_answer(
    question: str,
    financial_context: Optional[Any] = None,
    language: str = "en",
) -> Dict[str, Any]:
    """Orchestrates end-to-end grounded answer generation with language auto-detection and telemetry."""
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
            "rag_ms": 0.0,
            "llm_ms": 0.0,
            "language_reason": "empty_fallback",
        }

    # Auto-detect language (Devanagari, Hinglish keywords, explicit hints)
    effective_lang, lang_reason = detect_language(q, language)
    logger.info("Language auto-detection: '%s' -> %s (%s)", q[:45], effective_lang.upper(), lang_reason)

    # 1. Real-time Live Market Data
    live_data = None
    try:
        from rag.scripts.live_data.live_router import get_live_data
        live_data = await asyncio.to_thread(get_live_data, q)
    except Exception as exc:
        logger.debug("Live data router check failed: %s", exc)

    # 2. RAG Chunk Retrieval via Supabase with latency timing
    retrieved_chunks: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    rag_ms = 0.0
    t0_rag = time.perf_counter()
    try:
        vector = await asyncio.to_thread(get_embedding_vector, q)
        if vector:
            retrieved_chunks = await search_similar_chunks(
                query_embedding=vector,
                match_count=5,
                match_threshold=0.20,
            )
            rag_ms = round((time.perf_counter() - t0_rag) * 1000, 1)
            logger.info("RAG search for '%s' retrieved %d chunks in %s ms", q[:40], len(retrieved_chunks), rag_ms)
            for c in retrieved_chunks:
                sources.append({
                    "title": c.get("document_title") or c.get("source_name") or "DhanMITR Knowledge",
                    "source_type": c.get("data_type") or "scheme",
                    "snippet": (c.get("chunk_text") or "")[:200] + "...",
                    "url": c.get("source_url") or "",
                    "similarity": c.get("similarity", 0.0),
                })
        else:
            rag_ms = round((time.perf_counter() - t0_rag) * 1000, 1)
    except Exception as exc:
        rag_ms = round((time.perf_counter() - t0_rag) * 1000, 1)
        logger.warning("RAG vector retrieval failed: %s", exc)

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
    llm_ms = 0.0
    if groq_api_key:
        try:
            from groq import Groq
            groq_client = Groq(api_key=groq_api_key)

            # Build contexts (without leaking internal chunk IDs or metadata to LLM text output)
            rag_context_text = "\n\n".join(
                f"Information: {c.get('chunk_text')}"
                for c in retrieved_chunks
            ) if retrieved_chunks else "No specific policy document matched."

            live_context_text = _format_live_data_text(live_data) if live_data else "No live-data matched."

            # Build user prompt with conditional personal context & strict language directive
            if effective_lang == "hi":
                lang_directive = (
                    "MANDATORY INSTRUCTIONS:\n"
                    "1. LANGUAGE: The user communicated in Hindi. You MUST write the ENTIRE answer in natural, clear Hindi (Devanagari script). Do NOT reply in English.\n"
                    "2. PRIVACY & DISCRETION: Do NOT mention or disclose internal dataset names, document names, or chunk IDs (never say 'according to the dataset' or 'from the provided documents'). State the information directly and naturally.\n"
                    "3. FORMATTING: Plain conversational text only. NO Markdown (#, **, *, -, `), NO bullet asterisks. Use simple numbered lists (1. 2. 3.) when listing items.\n"
                    "4. Mention currency (INR/Rs.) when applicable."
                )
            else:
                lang_directive = (
                    "MANDATORY INSTRUCTIONS:\n"
                    "1. LANGUAGE: Respond clearly in natural, conversational English.\n"
                    "2. PRIVACY & DISCRETION: Do NOT mention or disclose internal dataset names, document names, or chunk IDs (never say 'according to the dataset' or 'from the provided documents'). State the information directly and naturally.\n"
                    "3. FORMATTING: Plain conversational text only. NO Markdown (#, **, *, -, `), NO bullet asterisks. Use simple numbered lists (1. 2. 3.) when listing items.\n"
                    "4. Mention currency (INR/Rs.) when applicable."
                )

            user_prompt_parts = [
                f"Language: {effective_lang.upper()}",
                "",
                "KNOWLEDGE CONTEXT:",
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
                lang_directive,
            ])

            user_prompt = "\n".join(user_prompt_parts)

            t0_llm = time.perf_counter()
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
            llm_ms = round((time.perf_counter() - t0_llm) * 1000, 1)
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
                    "rag_ms": rag_ms,
                    "llm_ms": llm_ms,
                    "language_reason": lang_reason,
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
        if effective_lang == "hi":
            answer_text = "इस विषय पर कोई विशिष्ट नीति दस्तावेज़ नहीं मिला। कृपया अपने प्रश्न को थोड़ा स्पष्ट करके पूछें।"
        else:
            answer_text = "No specific policy guidelines were found matching your query. Please provide more details or ask another question."

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
