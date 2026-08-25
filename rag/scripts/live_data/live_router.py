"""Route live-data questions to the appropriate provider."""

from __future__ import annotations

import re
import sys
from pathlib import Path


# -------------------------------------------------------------------
# Add project root to Python import path
# -------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# -------------------------------------------------------------------
# Live-data providers
# -------------------------------------------------------------------

from rag.scripts.live_data.coingecko import get_crypto_price
from rag.scripts.live_data.rbi import get_rbi_policy_rates
from rag.scripts.live_data.forex import get_exchange_rate
from rag.scripts.live_data.stocks import get_stock_price
from rag.scripts.live_data.metals import get_metals_prices


# ===================================================================
# CRYPTO
# ===================================================================

CRYPTO_ALIASES = {
    "bitcoin": "bitcoin",
    "btc": "bitcoin",

    "ethereum": "ethereum",
    "eth": "ethereum",

    "solana": "solana",
    "sol": "solana",

    "dogecoin": "dogecoin",
    "doge": "dogecoin",

    "xrp": "ripple",
    "ripple": "ripple",

    "cardano": "cardano",
    "ada": "cardano",
}


def detect_crypto(question: str) -> str | None:
    """Detect a supported cryptocurrency."""

    question_lower = question.lower()

    for name, coin_id in sorted(
        CRYPTO_ALIASES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):
        pattern = rf"\b{re.escape(name)}\b"

        if re.search(pattern, question_lower):
            return coin_id

    return None


def get_live_crypto_data(question: str) -> dict | None:
    """Retrieve live cryptocurrency data."""

    coin_id = detect_crypto(question)

    if not coin_id:
        return None

    return get_crypto_price(
        coin_id=coin_id,
        currency="inr",
    )


# ===================================================================
# RBI
# ===================================================================

RBI_KEYWORDS = [
    "repo rate",
    "repo",
    "sdf",
    "standing deposit facility",
    "msf",
    "marginal standing facility",
    "bank rate",
    "reverse repo",
    "reverse repo rate",
    "crr",
    "cash reserve ratio",
    "slr",
    "statutory liquidity ratio",
    "rbi rate",
    "rbi rates",
    "rbi policy rate",
    "policy rate",
]


def detect_rbi(question: str) -> bool:
    """Detect whether a question is related to RBI rates."""

    question_lower = question.lower()

    for keyword in RBI_KEYWORDS:
        if keyword in question_lower:
            return True

    return False


def get_live_rbi_data(question: str) -> dict | None:
    """Retrieve current RBI policy rates."""

    if not detect_rbi(question):
        return None

    return get_rbi_policy_rates()


# ===================================================================
# FOREX
# ===================================================================

FOREX_PAIRS = {
    "usd/inr": ("USD", "INR"),
    "usd inr": ("USD", "INR"),
    "usd to inr": ("USD", "INR"),
    "dollar to inr": ("USD", "INR"),
    "dollar inr": ("USD", "INR"),

    "eur/inr": ("EUR", "INR"),
    "eur inr": ("EUR", "INR"),
    "eur to inr": ("EUR", "INR"),
    "euro to inr": ("EUR", "INR"),
    "euro inr": ("EUR", "INR"),

    "gbp/inr": ("GBP", "INR"),
    "gbp inr": ("GBP", "INR"),
    "gbp to inr": ("GBP", "INR"),
    "pound to inr": ("GBP", "INR"),
    "pound inr": ("GBP", "INR"),
}


def detect_forex(question: str) -> tuple[str, str] | None:
    """Detect a supported forex pair."""

    question_lower = question.lower()

    for keyword, currencies in sorted(
        FOREX_PAIRS.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):
        if keyword in question_lower:
            return currencies

    return None


def get_live_forex_data(question: str) -> dict | None:
    """Retrieve live forex exchange-rate data."""

    pair = detect_forex(question)

    if not pair:
        return None

    base_currency, quote_currency = pair

    return get_exchange_rate(
        base_currency=base_currency,
        quote_currency=quote_currency,
    )


# ===================================================================
# STOCKS
# ===================================================================

STOCK_ALIASES = {
    "reliance": "RELIANCE.NS",
    "reliance industries": "RELIANCE.NS",

    "tcs": "TCS.NS",
    "tata consultancy services": "TCS.NS",

    "sbi": "SBIN.NS",
    "state bank of india": "SBIN.NS",

    "hdfc bank": "HDFCBANK.NS",
    "hdfcbank": "HDFCBANK.NS",
}


def detect_stock(question: str) -> str | None:
    """Detect a supported Indian stock."""

    question_lower = question.lower()

    for name, symbol in sorted(
        STOCK_ALIASES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):
        pattern = rf"\b{re.escape(name)}\b"

        if re.search(pattern, question_lower):
            return symbol

    return None


def get_live_stock_data(question: str) -> dict | None:
    """Retrieve live Indian stock data."""

    symbol = detect_stock(question)

    if not symbol:
        return None

    return get_stock_price(symbol)


# ===================================================================
# GOLD / SILVER
# ===================================================================

GOLD_KEYWORDS = [
    "gold",
    "gold price",
    "gold rate",
    "gold rates",
    "24k gold",
    "22k gold",
    "18k gold",
    "24 karat gold",
    "22 karat gold",
    "24kt gold",
    "22kt gold",
    "bullion",
    "सोना",
    "सोने",
    "स्वर्ण",
    "sone ka bhav",
    "sone ka rate",
    "sona",
    "sone",
    "sonaa",
]

SILVER_KEYWORDS = [
    "silver",
    "silver price",
    "silver rate",
    "silver rates",
    "चांदी",
    "चाँदी",
    "chandi ka bhav",
    "chandi ka rate",
    "chandi",
    "chandee",
]


def detect_metals(question: str) -> str | None:
    """Detect whether a question is about gold, silver, or both."""

    question_lower = question.lower()

    has_gold = any(keyword in question_lower for keyword in GOLD_KEYWORDS)
    has_silver = any(keyword in question_lower for keyword in SILVER_KEYWORDS)

    if has_gold and has_silver:
        return "both"
    if has_gold:
        return "gold"
    if has_silver:
        return "silver"

    return None


def get_live_metals_data(question: str) -> dict | None:
    """Retrieve live gold/silver prices."""

    metal = detect_metals(question)

    if not metal:
        return None

    data = get_metals_prices()

    if metal == "both":
        return {
            "provider": data["provider"],
            "asset": "Gold & Silver",
            "currency": data["currency"],
            "unit": data["unit"],
            "gold_price": data["gold_price"],
            "silver_price": data["silver_price"],
            "timestamp": data["timestamp"],
            "is_live": data["is_live"],
        }

    if metal == "gold":
        return {
            "provider": data["provider"],
            "asset": "Gold",
            "currency": data["currency"],
            "unit": data["unit"],
            "price": data["gold_price"],
            "timestamp": data["timestamp"],
            "is_live": data["is_live"],
        }

    return {
        "provider": data["provider"],
        "asset": "Silver",
        "currency": data["currency"],
        "unit": data["unit"],
        "price": data["silver_price"],
        "timestamp": data["timestamp"],
        "is_live": data["is_live"],
    }


# ===================================================================
# MAIN LIVE DATA ROUTER
# ===================================================================

def get_live_data(question: str) -> dict | None:
    """
    Route a question to the appropriate live-data provider(s).
    Supports multiple simultaneous providers for compound questions (e.g. Gold + RBI).
    """

    if not question or not question.strip():
        return None

    question = question.strip()
    matched_feeds = []

    # ---------------------------------------------------------------
    # 1. Crypto
    # ---------------------------------------------------------------
    try:
        crypto_data = get_live_crypto_data(question)
        if crypto_data:
            matched_feeds.append(crypto_data)
    except Exception:
        pass

    # ---------------------------------------------------------------
    # 2. RBI
    # ---------------------------------------------------------------
    try:
        rbi_data = get_live_rbi_data(question)
        if rbi_data:
            matched_feeds.append(rbi_data)
    except Exception:
        pass

    # ---------------------------------------------------------------
    # 3. Forex
    # ---------------------------------------------------------------
    try:
        forex_data = get_live_forex_data(question)
        if forex_data:
            matched_feeds.append(forex_data)
    except Exception:
        pass

    # ---------------------------------------------------------------
    # 4. Stocks
    # ---------------------------------------------------------------
    try:
        stock_data = get_live_stock_data(question)
        if stock_data:
            matched_feeds.append(stock_data)
    except Exception:
        pass

    # ---------------------------------------------------------------
    # 5. Gold / Silver
    # ---------------------------------------------------------------
    try:
        metals_data = get_live_metals_data(question)
        if metals_data:
            matched_feeds.append(metals_data)
    except Exception:
        pass

    if not matched_feeds:
        return None

    if len(matched_feeds) == 1:
        return matched_feeds[0]

    return {
        "provider": "multi_live_feed",
        "feeds": matched_feeds,
        "is_live": True,
    }



# ===================================================================
# TEST
# ===================================================================

def main() -> None:
    """Test all live-data providers."""

    questions = [
        "What is the current Bitcoin price?",
        "What is the price of Ethereum?",
        "What is the current repo rate?",
        "What is the SDF rate?",
        "What is USD to INR?",
        "What is EUR to INR?",
        "What is the current Reliance price?",
        "What is TCS trading at?",
        "What is the current gold price?",
        "What is the silver price?",
        "What is PM-KISAN?",
    ]

    for question in questions:

        print("\n" + "=" * 70)
        print(f"Question: {question}")

        try:

            data = get_live_data(question)

            if data:
                print("Live data found:")
                print(data)

            else:
                print("No live provider matched.")
                print("This question can be handled by RAG.")

        except Exception as exc:

            print(
                f"Live data request failed: "
                f"{type(exc).__name__}: {exc}"
            )


if __name__ == "__main__":
    main() 