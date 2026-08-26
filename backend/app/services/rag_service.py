"""RAG Retrieval and Grounded Answer Service for DhanMITR.

Queries the Supabase pgvector infrastructure via the rag.match_chunks() RPC,
routes real-time financial market queries (RBI, Metals, Forex, Crypto, Stocks),
and orchestrates grounded answer generation with Groq and speech-friendly summaries.
"""

import asyncio
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from supabase import Client, create_client

from backend.app.core.config import settings
from rag.scripts.live_data.tavily_search import search_web, build_web_context

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
_groq_client = None


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


def _get_groq_client():
    """Return a persistent Groq client with an active HTTP keep-alive connection pool."""
    global _groq_client
    if _groq_client is None:
        key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if key:
            from groq import Groq
            _groq_client = Groq(api_key=key)
    return _groq_client


def reset_client() -> None:
    """Reset the cached client (useful for testing)."""
    global _supabase_client, _groq_client
    _supabase_client = None
    _groq_client = None


def warmup_rag_model() -> None:
    """Pre-loads the BGE-M3 embedding model and warms the Groq client during startup."""
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

    try:
        _get_groq_client()
        logger.info("Groq client pre-warmed with persistent HTTP connection pool.")
    except Exception as exc:
        logger.warning("Groq pre-warm failed: %s", exc)


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
    # 0. Remove reasoning tags (<think>...</think>)
    clean = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    clean = re.sub(r"<think>.*", "", clean, flags=re.DOTALL)
    # 1. Remove code fences (```...```)
    clean = re.sub(r"```[^`]*```", "", clean, flags=re.DOTALL)
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

    provider = live_data.get("provider", "")
    asset = live_data.get("asset", "")

    # Handle multi-feed compound queries (e.g. Gold + RBI in the same question)
    if provider == "multi_live_feed":
        feeds = live_data.get("feeds", [])
        sections = [_format_live_data_text(feed) for feed in feeds]
        return "\n\n".join(sections)

    if "metals" in provider or asset in ("Gold", "Silver", "Gold & Silver"):
        currency = live_data.get("currency", "INR")
        unit = live_data.get("unit", "g")

        if asset == "Gold & Silver":
            gold_price = live_data.get("gold_price", 0.0)
            silver_price = live_data.get("silver_price", 0.0)
            return (
                f"Live Precious Metals Rates:\n"
                f"- Gold (24K): Rs. {gold_price:,.2f} per {unit} (Rs. {gold_price * 10:,.2f} per 10g {currency})\n"
                f"- Silver: Rs. {silver_price:,.2f} per {unit} (Rs. {silver_price * 10:,.2f} per 10g {currency})"
            )

        price = live_data.get("price", 0.0)
        ten_gram_price = price * 10
        return (
            f"Live Market Rate for {asset}:\n"
            f"- Spot Price: Rs. {price:,.2f} per {unit} (Rs. {ten_gram_price:,.2f} per 10 grams {currency})"
        )

    if "coingecko" in provider:
        price = live_data.get("price", 0.0)
        currency = live_data.get("currency", "INR").upper()
        change_24h = live_data.get("change_24h", 0.0)
        return (
            f"Live Rate for {asset}:\n"
            f"- Spot Price: Rs. {price:,.2f} {currency} (24-Hour Change: {change_24h:+.2f}%)"
        )

    if "twelve_data" in provider:
        rate = live_data.get("rate", 0.0)
        base = live_data.get("base_currency", "USD")
        quote = live_data.get("quote_currency", "INR")
        return f"Live Forex Exchange Rate:\n- 1 {base} = Rs. {rate:,.4f} {quote}"

    if "yfinance" in provider or live_data.get("symbol"):
        symbol = live_data.get("symbol", "")
        price = live_data.get("price", 0.0)
        exchange = live_data.get("exchange", "NSE")
        return f"Live Share Price for {symbol} ({exchange}): Rs. {price:,.2f} INR"

    if "rbi" in provider or live_data.get("rates"):
        rates = live_data.get("rates", {})
        rates_str = ", ".join(f"{k.replace('_', ' ').title()}: {v}%" for k, v in rates.items())
        return f"Current Official RBI Policy Rates:\n- {rates_str}"

    lines = ["Live Market Rates:"]
    for k, v in live_data.items():
        if isinstance(v, dict):
            lines.append(f"{k}:")
            for sk, sv in v.items():
                lines.append(f"  {sk}: {sv}")
        else:
            lines.append(f"{k}: {v}")
    return "\n".join(lines)



# ---------------------------------------------------------------------------
# Tavily Web Search Fallback
# ---------------------------------------------------------------------------

def _search_tavily_fallback(
    question: str,
) -> Tuple[List[Dict[str, Any]], str]:
    """Search Tavily when local RAG has no relevant result."""
    try:
        results = search_web(
            question,
            max_results=5,
            search_depth="basic",
        )
        if not results:
            return [], ""

        cleaned_results: List[Dict[str, Any]] = []
        for result in results:
            title = result.get("title") or "Web result"
            url = result.get("url") or ""
            content = result.get("content") or ""

            if not content and not url:
                continue

            cleaned_results.append(
                {
                    "title": title,
                    "url": url,
                    "content": content[:4000],
                }
            )

        if not cleaned_results:
            return [], ""

        return cleaned_results, build_web_context(cleaned_results)

    except Exception as exc:
        logger.warning("Tavily fallback search failed: %s", exc)
        return [], ""


def _format_web_sources(
    web_results: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Convert Tavily results into the application's source format."""
    return [
        {
            "title": result.get("title") or "Web result",
            "source_type": "web",
            "snippet": (result.get("content") or "")[:200] + "...",
            "url": result.get("url") or "",
        }
        for result in web_results
    ]


# ---------------------------------------------------------------------------
# Personal Finance Intent Detection & Context Formatting
# ---------------------------------------------------------------------------

_PERSONAL_INTENT_REGEX_PATTERNS = [
    # English possessive financial context (matches "my biggest expenses", "my spending breakdown", "show my budget", etc.)
    r"\b(?:my|i|me|mine|our)\b.*\b(?:spending|expenses?|budget|subscriptions?|salary|income|savings?|portfolio|investments?|loans?|emis?|insurance|coverages?|net\s*worth|bills?|money|account|cards?|finances?|cashflow|emergency\s*fund|ott|netflix|spotify|prime|hotstar|rent|groceries|shopping|outflow|surplus|runway|goals?|transactions?)\b",
    r"\b(?:what|show|check|tell|list|display|analyze|analyse|explain|breakdown|categorize)\b.*\b(?:my|i\s+spend|i\s+have|i\s+pay|i\s+earn|i\s+save)\b",
    r"\bhow\s+much\s+(?:did\s+i\s+spend|am\s+i\s+spending|do\s+i\s+(?:spend|save|earn|have|owe|pay))\b",
    r"\b(?:how\s+much\s+am\s+i\s+paying\s+for|what\s+is\s+my\s+active)\b",
    r"\b(?:can|could|should)\s+i\s+afford\b",
    r"\bwhere\s+(?:is\s+my\s+money\s+going|can\s+i\s+(?:cut|reduce|save)\s+(?:more|costs?|expenses?))\b",
    r"\b(?:my\s+)(?:ott|netflix|spotify|hotstar|amazon\s*prime|disney|zee5|jiocinema|youtube\s*premium)\b",
    r"\b(?:cut\s+my\s+expenses|reduce\s+my\s+costs?|my\s+financial\s+(?:health|summary|overview|status|snapshot))\b",
    r"\b(?:biggest|highest|largest|top)\s+(?:expenses?|spending|costs?|outflows?)\b",
    r"\b(?:spending|expense)\s+breakdown\b",
    r"\b(?:active|all)\s+subscriptions?\b",

    # Hindi possessive / personal patterns
    r"\b(?:मेरा|मेरी|मेरे|मुझको|मुझे|मैं|हम|हमारा|हमारी|हमारे)\b.*\b(?:खर्च|खर्चा|खर्चे|बचत|बजट|वेतन|सैलरी|आय|सब्सक्रिप्शन|बीमा|किस्त|ईएमआई|लोन|कर्ज|पैसे|खाता|इन्वेस्टमेंट|पोर्टफोलियो|नेटवर्थ|इमरजेंसी\s*फंड|रुपये|पैसा|खर्चों)\b",
    r"\b(?:मैं|हम)\s+(?:कितना\s+(?:बचा|खर्च|कमा)|क्या\s+(?:खरीद|अफोर्ड)\s+सकता)\b",
    r"\bमेरी\s+वित्तीय\s+स्थिति\b",
    r"\b(?:सबसे\s+बड़ा\s+खर्चा|खर्चों\s+का\s+विवरण|सक्रिय\s+सब्सक्रिप्शन)\b",
]

_COMPILED_PERSONAL_PATTERNS = [
    re.compile(pattern, re.IGNORECASE) for pattern in _PERSONAL_INTENT_REGEX_PATTERNS
]


def detect_personal_finance_intent(question: str) -> bool:
    """Return True if the user question refers to their personal finances, spending, or budget."""
    if not question:
        return False
    q_str = question.strip()
    return any(p.search(q_str) is not None for p in _COMPILED_PERSONAL_PATTERNS)


_DETAIL_REQUEST_KEYWORDS = [
    "detail", "detailed", "details", "explain in detail", "full explanation", "full details",
    "step by step", "in-depth", "deep dive", "elaborate", "comprehensive", "everything about",
    "complete guide", "all rules", "exhaustively", "bistar se", "bistar",
    "विस्तार से", "पूरी जानकारी", "विस्तृत", "पूरा विवरण", "स्टेप बाय स्टेप", "गहराई से",
    "पूरी तरह", "सब कुछ बताएं", "विस्तारपूर्वक", "पूरा बताओ",
]

def wants_detailed_explanation(question: str) -> bool:
    """Return True if the user explicitly requested a full, detailed, or in-depth explanation."""
    if not question:
        return False
    q_lower = question.lower()
    return any(kw in q_lower for kw in _DETAIL_REQUEST_KEYWORDS)



def format_user_financial_context(ctx: Any) -> str:
    """Format a FinancialContext (or dict) into a rich, itemized plain-text snapshot for the LLM."""
    if ctx is None:
        return ""

    if hasattr(ctx, "model_dump"):
        d = ctx.model_dump()
    elif isinstance(ctx, dict):
        d = ctx
    else:
        return ""

    lines: List[str] = ["USER PERSONAL FINANCIAL SNAPSHOT:"]

    # Profile summary
    profile = d.get("profile") or {}
    income = profile.get("monthly_income", 0) or d.get("monthly_income", 0)
    expenses = profile.get("monthly_expenses", 0) or d.get("monthly_expenses", 0)
    net_surplus = d.get("net_surplus", income - expenses)
    savings_rate = d.get("savings_rate_percentage", 0)
    net_worth = d.get("net_worth", 0)
    runway = d.get("runway_months", 0)

    if income or expenses:
        lines.append(
            f"Monthly Income: Rs.{income:,.0f} | Monthly Expenses: Rs.{expenses:,.0f} | "
            f"Net Surplus: Rs.{net_surplus:,.0f} ({savings_rate:.1f}% savings rate)"
        )
    if runway:
        lines.append(f"Emergency Fund Runway: {runway:.1f} months")
    if net_worth:
        lines.append(f"Estimated Net Worth: Rs.{net_worth:,.0f}")

    # Top spending categories breakdown
    categories = d.get("top_spending_categories") or []
    if categories:
        lines.append("Top Spending Categories Breakdown:")
        for cat in categories[:6]:
            name = cat.get("category", "Other") if isinstance(cat, dict) else getattr(cat, "category", "Other")
            amt = cat.get("amount", 0) if isinstance(cat, dict) else getattr(cat, "amount", 0)
            pct = cat.get("percentage", 0) if isinstance(cat, dict) else getattr(cat, "percentage", 0)
            lines.append(f"  - {name}: Rs.{amt:,.0f} ({pct:.1f}% of total outflow)")

    # Active itemized subscriptions
    subscriptions = d.get("subscriptions_list") or []
    if subscriptions:
        lines.append("Active Subscriptions List:")
        for s in subscriptions:
            name = s.get("name", "Service")
            amt = s.get("amount", 0)
            cycle = s.get("billing_cycle", "monthly")
            cat = s.get("category", "Entertainment")
            lines.append(f"  - {name}: Rs.{amt:,.0f}/{cycle} ({cat})")
    elif d.get("active_subscriptions_total"):
        lines.append(f"Active Subscriptions Total: Rs.{d.get('active_subscriptions_total'):,.0f}/month")

    # Recent Transactions / Top Outflow Items
    transactions = d.get("recent_transactions") or []
    if transactions:
        lines.append("Recent Major Outflows / Transactions:")
        for tx in transactions[:8]:
            title = tx.get("title", "Expense")
            amt = tx.get("amount", 0)
            cat = tx.get("category", "General")
            lines.append(f"  - {title}: Rs.{amt:,.0f} ({cat})")

    # Category Budgets
    budget_items = d.get("budget_items") or []
    if budget_items:
        lines.append("Budget vs Actuals:")
        for b in budget_items[:6]:
            cat = b.get("category", "Other")
            budgeted = b.get("budgeted_amount", 0)
            actual = b.get("actual_spent", 0)
            lines.append(f"  - {cat}: Budget Rs.{budgeted:,.0f} | Actual Spent Rs.{actual:,.0f}")

    # Active Goals
    goals = d.get("goals_list") or []
    if goals:
        lines.append("Active Financial Goals:")
        for g in goals:
            title = g.get("title", "Goal")
            target = g.get("target_amount", 0)
            current = g.get("current_amount", 0)
            lines.append(f"  - {title}: Rs.{current:,.0f} saved of Rs.{target:,.0f} target")

    # Insurance policies
    coverages = d.get("active_insurance_coverages") or []
    if coverages:
        lines.append(f"Active Insurance Policies: {', '.join(coverages)}")

    # Risk tolerance & employment
    risk = profile.get("risk_tolerance", "")
    emp = profile.get("employment_type", "")
    if risk or emp:
        parts = []
        if risk:
            parts.append(f"Risk Tolerance: {risk}")
        if emp:
            parts.append(f"Employment: {emp}")
        lines.append("Profile Details: " + " | ".join(parts))

    return "\n".join(lines) if len(lines) > 1 else ""


from backend.app.core.language_detector import detect_language


def _build_groq_messages(
    system_prompt_text: str,
    user_prompt: str,
    history: Optional[List[Any]] = None,
) -> List[Dict[str, str]]:
    """Builds the Groq messages payload including system prompt, multi-turn history, and the current user prompt."""
    messages = [{"role": "system", "content": system_prompt_text}]
    if history:
        for turn in history[-6:]:
            role = getattr(turn, "role", None) or (turn.get("role") if isinstance(turn, dict) else "user")
            content = getattr(turn, "content", None) or (turn.get("content") or turn.get("text") if isinstance(turn, dict) else "")
            if content and role in ("user", "assistant"):
                messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_prompt})
    return messages


def _extract_answer_and_reply(raw_text: str) -> Tuple[str, str]:
    """Robustly extracts 'answer' and 'reply_text' from LLM output, handling malformed JSON, unescaped characters, or markdown fences."""
    raw = (raw_text or "").strip()
    raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
    raw = re.sub(r"<think>.*", "", raw, flags=re.DOTALL).strip()
    answer = ""
    reply = ""

    cleaned = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    try:
        data = json.loads(cleaned, strict=False)
        if isinstance(data, dict):
            answer = str(data.get("answer") or "").strip()
            reply = str(data.get("reply_text") or "").strip()
    except Exception:
        pass

    if not answer and not reply:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0), strict=False)
                if isinstance(data, dict):
                    answer = str(data.get("answer") or "").strip()
                    reply = str(data.get("reply_text") or "").strip()
            except Exception:
                pass

    if not answer:
        ans_match = re.search(r'"answer"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned, re.DOTALL)
        if ans_match:
            try:
                answer = ans_match.group(1).encode("utf-8").decode("unicode_escape")
            except Exception:
                answer = ans_match.group(1)

    if not reply:
        rep_match = re.search(r'"reply_text"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned, re.DOTALL)
        if rep_match:
            try:
                reply = rep_match.group(1).encode("utf-8").decode("unicode_escape")
            except Exception:
                reply = rep_match.group(1)

    if not answer:
        answer = re.sub(r'^\s*\{\s*"answer"\s*:\s*"?', '', cleaned)
        answer = re.sub(r'"?\s*,\s*"reply_text"\s*:.*$', '', answer, flags=re.DOTALL)
        answer = answer.strip()
        if not answer:
            answer = cleaned

    if not reply:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?।\n])\s+', answer) if s.strip()]
        if sentences:
            short = " ".join(sentences[:2])
            words = short.split()
            if len(words) > 40:
                short = " ".join(words[:38]) + "..."
            reply = short
        else:
            reply = answer[:150]

    return answer, reply


# ---------------------------------------------------------------------------
# Hard Pre-LLM Off-Topic Gate
# ---------------------------------------------------------------------------
# If a query is clearly non-financial and matches blocked categories,
# return an instant refusal without burning an LLM call.

_FINANCE_ALLOW_KEYWORDS = {
    # Core finance
    "finance", "financial", "money", "bank", "banking", "loan", "emi", "interest",
    "credit", "debit", "savings", "saving", "invest", "investment", "investing",
    "mutual", "fund", "sip", "stock", "share", "market", "nifty", "sensex",
    "portfolio", "dividend", "equity", "bond", "fixed deposit", "fd", "rd",
    "recurring", "deposit", "withdrawal", "account", "upi", "neft", "rtgs",
    "imps", "cheque", "atm",

    # Tax
    "tax", "taxes", "itr", "income tax", "gst", "tds", "hra", "80c", "80d",
    "deduction", "exemption", "regime", "slab", "rebate", "refund",

    # Insurance
    "insurance", "lic", "premium", "claim", "policy", "term plan", "health insurance",
    "life insurance", "bima", "pmjjby", "pmsby",

    # Government schemes & welfare
    "scheme", "yojana", "yojna", "subsidy", "pension", "nps", "epf", "ppf",
    "gratuity", "provident", "pm kisan", "pmkisan", "pmay", "mudra", "scholarship",
    "sukanya", "atal", "jan dhan", "fasal", "kisan", "ayushman", "ujjwala",
    "digital india", "sarkari", "government", "welfare", "benefit", "portal",
    "eligibility", "apply", "registration",

    # Budgeting & personal finance
    "budget", "expense", "expenses", "spending", "income", "salary", "emi",
    "rent", "groceries", "subscription", "net worth", "emergency fund",
    "cashflow", "surplus", "deficit", "debt", "karz", "bachat",

    # Live market data
    "gold", "silver", "bitcoin", "crypto", "ethereum", "forex", "dollar",
    "usd", "inr", "euro", "rupee", "rupaya", "repo rate", "rbi", "sebi",
    "nse", "bse", "commodity", "crude", "oil", "bullion",

    # Hindi financial terms
    "पैसा", "पैसे", "बचत", "खर्च", "वेतन", "सैलरी", "बजट", "निवेश", "कर्ज",
    "ब्याज", "बीमा", "योजना", "लोन", "किस्त", "खाता", "बैंक", "सोना", "चांदी",
    "आय", "वित्तीय", "सरकारी", "पेंशन", "छात्रवृत्ति",
}

_BLOCKED_TOPIC_KEYWORDS = {
    # Sports
    "cricket", "ipl", "football", "soccer", "tennis", "basketball", "hockey",
    "world cup", "t20", "odi", "test match", "fifa", "olympic", "olympics",
    "champion", "league", "match", "tournament", "player", "batsman", "bowler",
    "goal", "wicket", "run chase", "innings", "stadium", "kohli", "dhoni",
    "messi", "ronaldo", "nba", "nfl", "premier league",

    # Entertainment & movies
    "movie", "movies", "film", "bollywood", "hollywood", "actor", "actress",
    "director", "song", "songs", "music", "singer", "album", "netflix series",
    "tv show", "web series", "anime", "manga", "cartoon", "celebrity",
    "shah rukh", "salman", "aamir", "oscar", "grammy", "avengers", "marvel",

    # Food & cooking
    "recipe", "recipes", "cook", "cooking", "food", "dish", "cuisine",
    "restaurant", "biryani", "pizza", "burger", "cake", "dessert",
    "ingredients", "calories", "diet plan",

    # Science & tech (non-finance)
    "nasa", "space", "planet", "mars", "moon landing", "black hole",
    "quantum", "atom", "chemistry", "physics", "biology", "dna",
    "programming", "python code", "javascript", "html", "css", "react code",
    "machine learning", "artificial intelligence", "chatgpt",

    # General trivia & history
    "president", "prime minister", "capital of", "tallest", "longest",
    "deepest", "oldest", "fastest", "biggest", "smallest", "population",
    "geography", "continent", "country", "flag", "anthem", "language of",
    "invented", "discovered", "who is", "who was", "who won",

    # Weather & travel
    "weather", "temperature", "forecast", "rain", "monsoon",
    "flight", "hotel", "tourist", "travel", "vacation", "holiday destination",

    # Gaming
    "game", "gaming", "pubg", "fortnite", "minecraft", "gta", "valorant",
    "esports", "playstation", "xbox", "nintendo",

    # Relationships & lifestyle
    "love", "dating", "relationship", "marriage advice", "horoscope",
    "astrology", "zodiac", "kundli", "rashifal",
}

_HINDI_FINANCE_KEYWORDS = [
    "पैसा", "पैसे", "बचत", "खर्च", "खर्चे", "वेतन", "सैलरी", "बजट", "निवेश", "कर्ज",
    "ब्याज", "बीमा", "योजना", "लोन", "किस्त", "खाता", "बैंक", "सोना", "चांदी",
    "आय", "वित्तीय", "सरकारी", "पेंशन", "छात्रवृत्ति", "टैक्स", "कर",
]

_HINDI_BLOCKED_KEYWORDS = [
    "क्रिकेट", "मैच", "आईपीएल", "फुटबॉल", "वर्ल्ड कप", "खिलाड़ी", "फिल्म", "मूवी",
    "गाना", "गाने", "एक्टर", "अभिनेता", "अभिनेत्री", "सिनेमा", "बॉलीवुड", "रेसिपी",
    "खाना", "बिरयानी", "मौसम", "बारिश", "तापमान", "राष्ट्रपति", "प्रधानमंत्री",
]

# Compile for fast matching
_FINANCE_ALLOW_RE = re.compile(
    r"\b(?:" + "|".join(re.escape(k) for k in sorted(_FINANCE_ALLOW_KEYWORDS, key=len, reverse=True)) + r")\b",
    re.IGNORECASE,
)
_BLOCKED_TOPIC_RE = re.compile(
    r"\b(?:" + "|".join(re.escape(k) for k in sorted(_BLOCKED_TOPIC_KEYWORDS, key=len, reverse=True)) + r")\b",
    re.IGNORECASE,
)

_OFF_TOPIC_REFUSAL_EN = (
    "I'm DhanMitra, your dedicated Indian personal finance and government schemes assistant. "
    "I can help you with budgeting, savings, investments, taxes, loans, insurance, "
    "government welfare schemes, and live market data like gold prices, stock prices, and RBI rates. "
    "Please feel free to ask me any financial question!"
)
_OFF_TOPIC_REFUSAL_HI = (
    "नमस्ते! धनमित्र आपकी व्यक्तिगत वित्त और सरकारी योजनाओं की सहायक है। "
    "बजट, बचत, निवेश, कर, लोन, बीमा, सरकारी कल्याणकारी योजनाएँ, "
    "और सोने की कीमत, शेयर बाज़ार, आरबीआई दरों जैसी लाइव मार्केट जानकारी में सहायता कर सकती हूँ। "
    "कृपया कोई भी वित्तीय प्रश्न पूछें!"
)


def _check_off_topic(question: str, lang: str) -> Optional[Dict[str, Any]]:
    """Return a canned refusal dict if the question is clearly off-topic, else None."""
    q_lower = question.lower()

    has_finance = bool(_FINANCE_ALLOW_RE.search(q_lower)) or any(k in question for k in _HINDI_FINANCE_KEYWORDS)
    has_blocked = bool(_BLOCKED_TOPIC_RE.search(q_lower)) or any(k in question for k in _HINDI_BLOCKED_KEYWORDS)

    # If the query has finance keywords, always let it through (even if it also mentions cricket)
    if has_finance:
        return None

    # If it has blocked keywords and zero finance signals, block it
    if has_blocked:
        refusal = _OFF_TOPIC_REFUSAL_HI if lang == "hi" else _OFF_TOPIC_REFUSAL_EN
        return {
            "question": question,
            "answer": refusal,
            "reply_text": refusal,
            "language": lang,
            "sources": [],
            "live_data": None,
            "suggested_actions": [
                "Ask about government schemes",
                "Check gold or stock prices",
                "Ask about budgeting or tax",
            ],
            "rag_ms": 0.0,
            "llm_ms": 0.0,
        }

    return None



async def generate_grounded_answer(
    question: str,
    financial_context: Optional[Any] = None,
    language: str = "en",
    history: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    """Orchestrates end-to-end grounded answer generation with language auto-detection, multi-turn history, and telemetry."""
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

    # ── Hard Pre-LLM Topic Gate ──────────────────────────────────────────
    # Block obviously off-topic queries BEFORE they reach the LLM.
    # If the query matches blocked topics and has zero finance signals,
    # return an instant refusal without wasting an LLM call.
    off_topic_result = _check_off_topic(q, effective_lang)
    if off_topic_result is not None:
        logger.info("Off-topic gate triggered for: '%s'", q[:60])
        off_topic_result["language_reason"] = lang_reason
        return off_topic_result
    # ─────────────────────────────────────────────────────────────────────

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
            raw_chunks = await search_similar_chunks(
                query_embedding=vector,
                match_count=5,
               match_threshold=0.50,
            )
            retrieved_chunks = [
             c for c in raw_chunks
             if c.get("similarity", 0.0) >= 0.50
]
            rag_ms = round((time.perf_counter() - t0_rag) * 1000, 1)
            logger.info("RAG search for '%s' retrieved %d relevant chunks in %s ms", q[:40], len(retrieved_chunks), rag_ms)
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

    # 3. Tavily Web Search Fallback
    # The hard off-topic gate runs before this, so blocked questions never
    # reach Tavily.
    web_results: List[Dict[str, Any]] = []
    web_context_text = ""

    if not retrieved_chunks and not live_data:
        try:
            web_results, web_context_text = await asyncio.wait_for(
                asyncio.to_thread(_search_tavily_fallback, q),
                timeout=3.5,
            )
            if web_results:
                sources.extend(_format_web_sources(web_results))
                logger.info(
                    "RAG had no relevant chunks; Tavily returned %d web results.",
                    len(web_results),
                )
        except (asyncio.TimeoutError, Exception) as web_exc:
            logger.warning("Tavily fallback search skipped or timed out: %s", web_exc)

    # 4. Conditional Personal Finance Context Injection
    is_personal = detect_personal_finance_intent(q)
    user_context_text = ""
    if financial_context:
        # If user explicitly asked a personal query OR if financial snapshot has non-zero details
        user_context_text = format_user_financial_context(financial_context)
        if user_context_text and is_personal:
            logger.debug("Personal finance intent detected — attaching rich user financial snapshot.")

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
    groq_client = _get_groq_client()
    llm_ms = 0.0
    if groq_client:
        try:
            # Build contexts (without leaking internal chunk IDs or metadata to LLM text output)
            rag_context_text = "\n\n".join(
                f"Information: {c.get('chunk_text')}"
                for c in retrieved_chunks
            ) if retrieved_chunks else "No relevant local knowledge-base information was retrieved."

            live_context_text = _format_live_data_text(live_data) if live_data else "No live-data matched."

            web_context_for_prompt = (
                "CURRENT WEB SEARCH RESULTS (TAVILY FALLBACK):\n"
                "Use these results only when they directly support the user's question. "
                "Do not invent facts that are not present in the results.\n\n"
                + web_context_text
                if web_context_text
                else "No web-search fallback results were retrieved."
            )

            # Build user prompt with conditional personal context & strict language directive
            is_detail = wants_detailed_explanation(q)
            if effective_lang == "hi":
                answer_detail_rule_hi = (
                    "2. 'answer': The user explicitly asked for full / detailed explanation. Provide a comprehensive, in-depth breakdown covering eligibility, benefits, and steps in natural Hindi (Devanagari script). Plain text, clean formatting with simple numbered lists (1. 2. 3.) if needed. NO Markdown (#, **, *).\n"
                    if is_detail else
                    "2. 'answer': PROGRESSIVE DISCLOSURE (CONCISE & CURATED FIRST): Keep the answer SHORT, CRISP, AND CURATED (strictly under 60-100 words, 2-3 concise points). State the direct core answer, key amount/percentage, or primary rule immediately without lengthy essay paragraphs. At the end, add a brief 1-sentence offer: 'यदि आप इसके नियम, आवेदन प्रक्रिया या दस्तावेजों का विस्तृत विवरण चाहते हैं, तो कृपया बताएं।'. Plain text in natural Hindi (Devanagari script), NO Markdown (#, **, *).\n"
                )
                lang_directive = (
                    "MANDATORY INSTRUCTIONS:\n"
                    "1. OUTPUT FORMAT: You MUST return a valid JSON object with exactly two keys:\n"
                    '   {\n'
                    '     "answer": "<Explanation for UI screen>",\n'
                    '     "reply_text": "<Concise 2 to 3 sentence spoken summary>"\n'
                    '   }\n'
                    + answer_detail_rule_hi +
                    "3. 'reply_text': A concise, friendly, warm spoken summary (strictly 2 to 3 natural sentences, under 35-45 words) in Hindi (Devanagari script) designed specifically for voice Text-to-Speech playback (e.g., 'यहाँ शिक्षा और वित्तीय सहायता के लिए 2 प्रमुख योजनाएँ उपलब्ध हैं: पीएम यशस्वी और स्टैंड अप इंडिया। पूरा विवरण आपकी स्क्रीन पर प्रदर्शित है।').\n"
                    "4. GENDER & TONE (VOICE ALIGNMENT): DhanMitra speaks with a female Indian voice (Swara). Maintain a polite, warm, and gender-neutral / inclusive tone. NEVER use 1st-person masculine Hindi verbs or endings (e.g. NEVER say 'करता हूँ', 'बताता हूँ', 'सकता हूँ', 'करूँगा', 'बताऊँगा'). Prefer objective, elegant phrasing like 'यहाँ विवरण प्रस्तुत है', 'आइए समझते हैं', 'धनमित्र आपकी सहायता के लिए उपस्थित है', 'सलाह दी जाती है'. Do not assume the user's gender.\n"
                    "5. PRIVACY & DISCRETION: Do NOT mention or disclose internal dataset names, document names, or chunk IDs (never say 'according to the dataset' or 'from the provided documents'). State the information directly and naturally.\n"
                    "6. STRICT DOMAIN BOUNDARY (HYBRID QUERY RULE): Answer ONLY the financial, banking, or government scheme portion. If the user also asks about non-financial topics (such as celebrity biographies, actors, movies, cricket, sports, general trivia, e.g. 'who is Salman Khan'), you MUST refuse that non-financial portion in one sentence and NOT provide any biographical or entertainment information.\n"
                    "7. Mention currency (INR/Rs.) when applicable."
                )
            else:
                answer_detail_rule_en = (
                    "2. 'answer': The user explicitly asked for full / detailed explanation. Provide a comprehensive, in-depth breakdown covering eligibility, benefits, and steps in clear, natural English. Plain text, clean formatting with simple numbered lists (1. 2. 3.) if needed. NO Markdown (#, **, *).\n"
                    if is_detail else
                    "2. 'answer': PROGRESSIVE DISCLOSURE (CONCISE & CURATED FIRST): Keep the answer SHORT, CRISP, AND CURATED (strictly under 60-100 words, 2-3 concise points). State the direct core answer, key amount/percentage, or primary rule immediately without lengthy essay paragraphs. At the end, add a brief 1-sentence offer: 'Let me know if you would like a detailed breakdown, step-by-step application steps, or required documents.' Plain text in clear English, NO Markdown (#, **, *).\n"
                )
                lang_directive = (
                    "MANDATORY INSTRUCTIONS:\n"
                    "1. OUTPUT FORMAT: You MUST return a valid JSON object with exactly two keys:\n"
                    '   {\n'
                    '     "answer": "<Explanation for UI screen>",\n'
                    '     "reply_text": "<Concise 2 to 3 sentence spoken summary>"\n'
                    '   }\n'
                    + answer_detail_rule_en +
                    "3. 'reply_text': A concise, friendly, warm spoken summary (strictly 2 to 3 natural sentences, under 35-45 words) designed specifically for voice Text-to-Speech playback (e.g., 'Here are 2 major schemes available for education and financial assistance: PM Yashasvi and Stand Up India. The full eligibility details are displayed on your screen.').\n"
                    "4. GENDER & TONE (VOICE ALIGNMENT): DhanMitra speaks with a female Indian voice (Neerja). Maintain a warm, polite, objective, and gender-neutral tone. Avoid gendered assumptions for both the assistant and the user.\n"
                    "5. PRIVACY & DISCRETION: Do NOT mention or disclose internal dataset names, document names, or chunk IDs (never say 'according to the dataset' or 'from the provided documents'). State the information directly and naturally.\n"
                    "6. STRICT DOMAIN BOUNDARY (HYBRID QUERY RULE): Answer ONLY the financial, banking, or government scheme portion. If the user also asks about non-financial topics (such as celebrity biographies, actors, movies, cricket, sports, general trivia, e.g. 'who is Salman Khan'), you MUST refuse that non-financial portion in one sentence and NOT provide any biographical or entertainment information.\n"
                    "7. Mention currency (INR/Rs.) when applicable."
                )

            if live_data:
                user_prompt_parts = [
                    f"Language: {effective_lang.upper()}",
                    "",
                    "REAL-TIME LIVE MARKET DATA (PRIMARY SOURCE OF TRUTH - USE THIS DATA DIRECTLY):",
                    live_context_text,
                    "",
                    "ADDITIONAL BACKGROUND CONTEXT:",
                    rag_context_text,
                ]
            elif web_context_text:
                user_prompt_parts = [
                    f"Language: {effective_lang.upper()}",
                    "",
                    "WEB SEARCH CONTEXT (TAVILY FALLBACK):",
                    web_context_for_prompt,
                    "",
                    "LOCAL KNOWLEDGE-BASE CONTEXT:",
                    rag_context_text,
                ]
            else:
                user_prompt_parts = [
                    f"Language: {effective_lang.upper()}",
                    "",
                    "KNOWLEDGE CONTEXT:",
                    rag_context_text,
                ]

            # Inject personal finance snapshot
            if user_context_text and (is_personal or not retrieved_chunks):
                user_prompt_parts.extend(["", user_context_text])

            user_prompt_parts.extend([
                "",
                "USER QUESTION:",
                q,
                "",
                lang_directive,
            ])

            user_prompt = "\n".join(user_prompt_parts)
            groq_messages = _build_groq_messages(system_prompt_text, user_prompt, history)

            t0_llm = time.perf_counter()
            response = await asyncio.to_thread(
                lambda: groq_client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=groq_messages,
                    temperature=0.2,
                    max_tokens=700,
                    extra_body={"reasoning_format": "hidden"},
                )
            )
            llm_ms = round((time.perf_counter() - t0_llm) * 1000, 1)
            generated_raw = (response.choices[0].message.content or "").strip()
            if generated_raw:
                raw_ans, raw_rep = _extract_answer_and_reply(generated_raw)
                clean_answer = sanitize_plain_text(raw_ans)
                spoken_reply = sanitize_plain_text(raw_rep)

                # Clear sources if this is a personal finance query or off-topic redirection
                is_explicit_scheme_query = any(kw in q.lower() for kw in [
                    "yojana", "scheme", "policy", "portal", "eligibility", "apply", "subsidy", "nps", "epf", "ppf", "pmjjby", "pmsby", "pmkisan", "pm-kisan", "pmay", "scholarship", "योजना"
                ])
                off_topic_indicators = [
                    "dedicated assistant",
                    "dedicated indian personal finance",
                    "dedicated personal finance",
                    "financial and government scheme",
                    "can only assist with",
                    "can only help with",
                    "केवल वित्तीय",
                    "समर्पित भारतीय",
                    "केवल व्यक्तिगत वित्त",
                ]
                effective_sources = sources
                if (is_personal and not is_explicit_scheme_query) or any(phrase in clean_answer.lower() for phrase in off_topic_indicators):
                    effective_sources = []

                return {
                    "question": q,
                    "answer": clean_answer,
                    "reply_text": spoken_reply,
                    "language": effective_lang,
                    "sources": effective_sources,
                    "live_data": live_data,
                    "web_data": web_results,
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
            spoken_reply = (
                f"The current RBI repo rate is {rates.get('repo_rate', 'N/A')} percent. The complete policy rate breakdown is displayed on your screen."
                if effective_lang != "hi"
                else f"वर्तमान आरबीआई रेपो दर {rates.get('repo_rate', 'N/A')}% है। संपूर्ण विवरण आपकी स्क्रीन पर प्रदर्शित है।"
            )
        elif provider == "metals_dev" or live_data.get("asset") in ("Gold", "Silver", "Gold & Silver", "gold", "silver", "both"):
            asset = live_data.get("asset", "Precious Metal")
            unit = live_data.get("unit", "g")
            if asset in ("Gold & Silver", "both"):
                gold_price = live_data.get("gold_price", 0.0)
                silver_price = live_data.get("silver_price", 0.0)
                answer_text = (
                    f"Current Live Precious Metal Prices:\n"
                    f"1. Gold (24K): Rs. {gold_price:,.2f} per gram (Rs. {gold_price * 10:,.0f} per 10g)\n"
                    f"2. Silver: Rs. {silver_price:,.2f} per gram (Rs. {silver_price * 10:,.0f} per 10g)"
                )
                spoken_reply = (
                    f"Current 24K Gold is Rs.{gold_price * 10:,.0f} per 10g and Silver is Rs.{silver_price * 10:,.0f} per 10g. Complete details are on your screen."
                    if effective_lang != "hi"
                    else f"वर्तमान 24 कैरेट सोने का भाव Rs.{gold_price * 10:,.0f} प्रति 10 ग्राम और चांदी का भाव Rs.{silver_price * 10:,.0f} प्रति 10 ग्राम है।"
                )
            else:
                price = live_data.get("price", 0.0)
                ten_gram = price * 10
                answer_text = (
                    f"Current Live {asset.title()} Price:\n"
                    f"- Spot Rate: Rs. {price:,.2f} per {unit} (Rs. {ten_gram:,.0f} per 10 grams)"
                )
                spoken_reply = (
                    f"The current live price for {asset} is Rs.{price:,.2f} per gram or Rs.{ten_gram:,.0f} per 10 grams."
                    if effective_lang != "hi"
                    else f"{asset} का वर्तमान भाव Rs.{price:,.2f} प्रति ग्राम या Rs.{ten_gram:,.0f} प्रति 10 ग्राम है।"
                )
        elif provider == "twelve_data":
            rate = live_data.get("rate", 0.0)
            base = live_data.get("base_currency", "USD")
            quote = live_data.get("quote_currency", "INR")
            answer_text = f"Current Live Forex Rate: 1 {base} = Rs. {rate:,.4f} {quote}"
            spoken_reply = (
                f"The current exchange rate is 1 {base} equals Rs. {rate:,.2f} {quote}."
                if effective_lang != "hi"
                else f"वर्तमान विनिमय दर 1 {base} = Rs. {rate:,.2f} {quote} है।"
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
            spoken_reply = (
                f"The current price of {asset} is Rs.{price:,.2f} with a 24-hour change of {change:+.2f}%. Details are on your screen."
                if effective_lang != "hi"
                else f"{asset} की वर्तमान कीमत Rs.{price:,.2f} है। पूरा विवरण स्क्रीन पर उपलब्ध है।"
            )
        elif provider == "yfinance":
            symbol = live_data.get("symbol", "Stock")
            price = live_data.get("price", 0)
            answer_text = f"Current {symbol} Stock Price: Rs.{price:,.2f} INR (via Live NSE/BSE Feed)"
            spoken_reply = (
                f"The current stock price of {symbol} is Rs.{price:,.2f}. Details are on your screen."
                if effective_lang != "hi"
                else f"{symbol} का शेयर मूल्य Rs.{price:,.2f} है।"
            )
        else:
            answer_text = f"{_format_live_data_text(live_data)}"
            spoken_reply = (
                "Here is the requested live financial market data. The complete details are shown on your screen."
                if effective_lang != "hi"
                else "यह रहा आपका लाइव मार्केट डेटा। संपूर्ण विवरण स्क्रीन पर है।"
            )
    elif retrieved_chunks:
        top_chunk = retrieved_chunks[0]
        title = top_chunk.get("document_title") or "Financial Scheme Knowledge"
        text = top_chunk.get("chunk_text", "")
        answer_text = f"{title}\n\n{text}"
        spoken_reply = (
            f"Here is the key information regarding {title}. The full guidelines are displayed on your screen."
            if effective_lang != "hi"
            else f"यहाँ {title} से संबंधित महत्वपूर्ण जानकारी प्रस्तुत है। पूरा विवरण स्क्रीन पर है।"
        )
    elif web_results:
        first = web_results[0]
        answer_text = (
            f"{first.get('title', 'Web result')}\n\n"
            f"{first.get('content', 'No readable web content was returned.')}\n\n"
            f"Source: {first.get('url', '')}"
        )
        spoken_reply = (
            f"Here is the information from web sources. The complete details are displayed on your screen."
            if effective_lang != "hi"
            else "वेब खोज से प्राप्त जानकारी स्क्रीन पर उपलब्ध है।"
        )
    else:
        if effective_lang == "hi":
            answer_text = "इस विषय पर कोई विशिष्ट नीति दस्तावेज़ नहीं मिला। कृपया अपने प्रश्न को थोड़ा स्पष्ट करके पूछें।"
            spoken_reply = answer_text
        else:
            answer_text = "No specific policy guidelines were found matching your query. Please provide more details or ask another question."
            spoken_reply = answer_text

    # Sanitize all output
    answer_text = sanitize_plain_text(answer_text)
    spoken_reply = sanitize_plain_text(spoken_reply)

    return {
        "question": q,
        "answer": answer_text,
        "reply_text": spoken_reply,
        "language": effective_lang,
        "sources": sources,
        "live_data": live_data,
        "suggested_actions": ["Analyze my spending", "Compare tax regimes", "Show investment tips"],
        "rag_ms": rag_ms,
        "llm_ms": llm_ms,
        "language_reason": lang_reason,
    }


async def stream_grounded_answer(
    question: str,
    financial_context: Optional[Any] = None,
    language: str = "en",
    history: Optional[List[Any]] = None,
):
    """Async generator yielding Server-Sent Events (SSE) for low-latency streaming responses (<200ms TTFT)."""
    q = (question or "").strip()
    if not q:
        yield f"event: delta\ndata: {json.dumps({'text': 'Please provide a question or topic.'})}\n\n"
        yield f"event: done\ndata: {json.dumps({'total_ms': 0})}\n\n"
        return

    pipeline_start = time.perf_counter()
    effective_lang, lang_reason = detect_language(q, language)

    # ── Hard Pre-LLM Off-Topic Gate ──────────────────────────────────────
    off_topic_result = _check_off_topic(q, effective_lang)
    if off_topic_result is not None:
        logger.info("Off-topic gate triggered in stream for: '%s'", q[:60])
        refusal_text = off_topic_result["answer"]
        yield f"event: metadata\ndata: {json.dumps({'sources': [], 'language': effective_lang, 'live_data': None, 'rag_ms': 0.0})}\n\n"
        yield f"event: delta\ndata: {json.dumps({'text': refusal_text})}\n\n"
        yield f"event: done\ndata: {json.dumps({'total_ms': 0.0, 'rag_ms': 0.0, 'llm_ms': 0.0})}\n\n"
        return
    # ─────────────────────────────────────────────────────────────────────

    # 1. Live market data
    live_data = None
    try:
        from rag.scripts.live_data.live_router import get_live_data
        live_data = await asyncio.to_thread(get_live_data, q)
    except Exception as exc:
        logger.debug("Live data router check failed: %s", exc)

    # 2. Vector search
    retrieved_chunks: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    rag_ms = 0.0
    t0_rag = time.perf_counter()
    try:
        vector = await asyncio.to_thread(get_embedding_vector, q)
        if vector:
            raw_chunks = await search_similar_chunks(
                query_embedding=vector,
                match_count=5,
                match_threshold=0.50,
            ) 
            retrieved_chunks = [
                c for c in raw_chunks
                if c.get("similarity", 0.0) >= 0.50
        ]
            rag_ms = round((time.perf_counter() - t0_rag) * 1000, 1)
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
        logger.warning("RAG retrieval failed: %s", exc)

    # 3. Tavily Web Search Fallback
    # The hard off-topic gate has already run, so blocked questions never
    # reach Tavily.
    web_results: List[Dict[str, Any]] = []
    web_context_text = ""

    if not retrieved_chunks and not live_data:
        try:
            web_results, web_context_text = await asyncio.wait_for(
                asyncio.to_thread(_search_tavily_fallback, q),
                timeout=3.5,
            )
            if web_results:
                sources.extend(_format_web_sources(web_results))
                logger.info(
                    "Streaming path: RAG had no relevant chunks; Tavily returned %d web results.",
                    len(web_results),
                )
        except (asyncio.TimeoutError, Exception) as web_exc:
            logger.warning("Streaming Tavily fallback search skipped or timed out: %s", web_exc)

    # 4. Personal Finance & Scheme Intent Filtering
    is_personal = detect_personal_finance_intent(q)
    is_explicit_scheme_query = any(kw in q.lower() for kw in [
        "yojana", "scheme", "policy", "portal", "eligibility", "apply", "subsidy", "nps", "epf", "ppf", "pmjjby", "pmsby", "pmkisan", "pm-kisan", "pmay", "scholarship", "योजना"
    ])
    effective_sources = sources
    if is_personal and not is_explicit_scheme_query:
        effective_sources = []

    # Yield initial metadata event immediately to UI
    yield f"event: metadata\ndata: {json.dumps({'sources': effective_sources, 'language': effective_lang, 'live_data': live_data, 'web_data': web_results, 'rag_ms': rag_ms})}\n\n"

    # 4. Personal Finance Snapshot
    user_context_text = ""
    if financial_context:
        user_context_text = format_user_financial_context(financial_context)

    # 5. Load prompt
    _system_prompt_path = ROOT_DIR / "rag" / "scripts" / "prompts" / "system_prompt.txt"
    try:
        system_prompt_text = _system_prompt_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        system_prompt_text = "You are DhanMITR, a helpful and precise Indian financial assistant."

    rag_context_text = "\n\n".join(
        f"Information: {c.get('chunk_text')}" for c in retrieved_chunks
    ) if retrieved_chunks else "No relevant local knowledge-base information was retrieved."

    live_context_text = _format_live_data_text(live_data) if live_data else "No live-data matched."

    web_context_for_prompt = (
        "CURRENT WEB SEARCH RESULTS (TAVILY FALLBACK):\n"
        "Use these results only when they directly support the user's question. "
        "Do not invent facts that are not present in the results.\n\n"
        + web_context_text
        if web_context_text
        else "No web-search fallback results were retrieved."
    )

    is_detail = wants_detailed_explanation(q)
    if effective_lang == "hi":
        detail_rule_hi = (
            "4. DEPTH: The user explicitly asked for full / detailed explanation. Provide a comprehensive, in-depth breakdown covering eligibility, benefits, and steps using simple numbered lists."
            if is_detail else
            "4. PROGRESSIVE DISCLOSURE (CONCISE FIRST): Keep the answer SHORT, CRISP, AND CURATED (strictly under 60-100 words, 2-3 concise points). State the core answer and key numbers immediately without long essay paragraphs. End with a brief 1-sentence offer: 'यदि आप इसके नियम, आवेदन प्रक्रिया या दस्तावेजों का विस्तृत विवरण चाहते हैं, तो कृपया बताएं।'"
        )
        lang_directive = (
            "MANDATORY INSTRUCTIONS:\n"
            "1. LANGUAGE: You MUST write the ENTIRE answer in natural, clear Hindi (Devanagari script).\n"
            "2. GENDER & TONE: DhanMitra speaks with a female Indian voice (Swara). Maintain a polite, warm, and gender-neutral tone. NEVER use 1st-person masculine Hindi verbs (e.g. NEVER say 'करता हूँ', 'बताता हूँ', 'सकता हूँ', 'करूँगा').\n"
            "3. PRIVACY: Do NOT disclose internal dataset names or chunk IDs. State information directly.\n"
            + detail_rule_hi + "\n"
            "5. STRICT DOMAIN BOUNDARY (HYBRID QUERY RULE): Answer ONLY the financial, banking, or government scheme portion. If the user also asks about non-financial topics (such as celebrity biographies, actors like Salman Khan, movies, cricket, sports, general trivia), you MUST refuse that non-financial portion in one sentence and NOT provide any biographical or entertainment information.\n"
            "6. FORMATTING: Plain conversational text only. NO Markdown headers or bullet asterisks. Use simple numbered lists (1. 2. 3.) when listing items.\n"
            "7. Mention currency (INR/Rs.) when applicable."
        )
    else:
        detail_rule_en = (
            "4. DEPTH: The user explicitly asked for full / detailed explanation. Provide a comprehensive, in-depth breakdown covering eligibility, benefits, and steps using simple numbered lists."
            if is_detail else
            "4. PROGRESSIVE DISCLOSURE (CONCISE FIRST): Keep the answer SHORT, CRISP, AND CURATED (strictly under 60-100 words, 2-3 concise points). State the core answer and key numbers immediately without long essay paragraphs. End with a brief 1-sentence offer: 'Let me know if you would like a detailed breakdown, step-by-step application steps, or required documents.'"
        )
        lang_directive = (
            "MANDATORY INSTRUCTIONS:\n"
            "1. LANGUAGE: Respond clearly in natural, conversational English.\n"
            "2. GENDER & TONE: DhanMitra speaks with a female Indian voice (Neerja). Maintain a warm, polite, objective, and gender-neutral tone.\n"
            "3. PRIVACY: Do NOT disclose internal dataset names or chunk IDs. State information directly.\n"
            + detail_rule_en + "\n"
            "5. STRICT DOMAIN BOUNDARY (HYBRID QUERY RULE): Answer ONLY the financial, banking, or government scheme portion. If the user also asks about non-financial topics (such as celebrity biographies, actors like Salman Khan, movies, cricket, sports, general trivia), you MUST refuse that non-financial portion in one sentence and NOT provide any biographical or entertainment information.\n"
            "6. FORMATTING: Plain conversational text only. NO Markdown headers or bullet asterisks. Use simple numbered lists (1. 2. 3.) when listing items.\n"
            "7. Mention currency (INR/Rs.) when applicable."
        )

    if live_data:
        user_prompt_parts = [
            f"Language: {effective_lang.upper()}",
            "",
            "REAL-TIME LIVE MARKET DATA (PRIMARY SOURCE OF TRUTH):",
            live_context_text,
            "",
            "ADDITIONAL BACKGROUND CONTEXT:",
            rag_context_text,
        ]
    elif web_context_text:
        user_prompt_parts = [
            f"Language: {effective_lang.upper()}",
            "",
            "WEB SEARCH CONTEXT (TAVILY FALLBACK):",
            web_context_for_prompt,
            "",
            "LOCAL KNOWLEDGE-BASE CONTEXT:",
            rag_context_text,
        ]
    else:
        user_prompt_parts = [
            f"Language: {effective_lang.upper()}",
            "",
            "KNOWLEDGE CONTEXT:",
            rag_context_text,
        ]

    if user_context_text and (is_personal or not retrieved_chunks):
        user_prompt_parts.extend(["", user_context_text])

    user_prompt_parts.extend([
        "",
        "USER QUESTION:",
        q,
        "",
        lang_directive,
    ])

    user_prompt = "\n".join(user_prompt_parts)
    groq_messages = _build_groq_messages(system_prompt_text, user_prompt, history)

    groq_client = _get_groq_client()
    accumulated_text = []
    t0_llm = time.perf_counter()
    if groq_client:
        try:
            stream = groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=groq_messages,
                temperature=0.2,
                max_tokens=700,
                stream=True,
                extra_body={"reasoning_format": "hidden"},
            )
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    token_text = chunk.choices[0].delta.content
                    accumulated_text.append(token_text)
                    yield f"event: delta\ndata: {json.dumps({'text': token_text})}\n\n"
        except Exception as exc:
            logger.warning("Groq stream exception: %s", exc)
            fallback = "I encountered a momentary issue generating the response. Please try again."
            yield f"event: delta\ndata: {json.dumps({'text': fallback})}\n\n"

    total_ms = round((time.perf_counter() - pipeline_start) * 1000, 1)
    llm_ms = round((time.perf_counter() - t0_llm) * 1000, 1)

    yield f"event: done\ndata: {json.dumps({'total_ms': total_ms, 'rag_ms': rag_ms, 'llm_ms': llm_ms})}\n\n"

