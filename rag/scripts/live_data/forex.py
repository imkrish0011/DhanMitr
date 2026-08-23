"""Fetch live forex exchange rates using Twelve Data."""

from __future__ import annotations

import os
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv


load_dotenv()


TWELVE_DATA_URL = "https://api.twelvedata.com/exchange_rate"


def convert_timestamp(timestamp) -> str | None:
    """Convert Twelve Data Unix timestamp to readable UTC time."""

    if timestamp is None:
        return None

    try:
        unix_timestamp = int(timestamp)

        return datetime.fromtimestamp(
            unix_timestamp,
            tz=timezone.utc,
        ).strftime("%Y-%m-%d %H:%M:%S UTC")

    except (TypeError, ValueError, OSError):
        return None


def get_exchange_rate(
    base_currency: str,
    quote_currency: str,
) -> dict:
    """Fetch a live exchange rate."""

    api_key = os.getenv("TWELVE_DATA_API_KEY")

    if not api_key:
        raise RuntimeError(
            "TWELVE_DATA_API_KEY is not set in .env"
        )

    symbol = f"{base_currency.upper()}/{quote_currency.upper()}"

    response = requests.get(
        TWELVE_DATA_URL,
        params={
            "symbol": symbol,
            "apikey": api_key,
        },
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    if "rate" not in data:
        raise RuntimeError(
            f"Twelve Data did not return a rate: {data}"
        )

    readable_timestamp = convert_timestamp(
        data.get("timestamp")
    )

    return {
        "provider": "twelve_data",
        "asset": symbol,
        "base_currency": base_currency.upper(),
        "quote_currency": quote_currency.upper(),
        "rate": float(data["rate"]),
        "timestamp": readable_timestamp,
        "is_live": True,
    }


def main() -> None:
    """Test live forex rates."""

    pairs = [
        ("USD", "INR"),
        ("EUR", "INR"),
        ("GBP", "INR"),
    ]

    for base, quote in pairs:
        try:
            data = get_exchange_rate(base, quote)

            print()
            print("=" * 50)
            print(f"{data['asset']}")
            print(f"Rate: {data['rate']}")
            print(f"Timestamp: {data['timestamp']}")
            print(f"Provider: {data['provider']}")

        except Exception as exc:
            print()
            print(f"{base}/{quote} failed:")
            print(f"{type(exc).__name__}: {exc}")


if __name__ == "__main__":
    main()