"""CoinGecko live cryptocurrency data client for DhanMitra."""

from __future__ import annotations

import os

import requests
from dotenv import load_dotenv


load_dotenv()


COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"


COIN_NAMES = {
    "bitcoin": "Bitcoin",
    "ethereum": "Ethereum",
    "solana": "Solana",
    "dogecoin": "Dogecoin",
    "ripple": "XRP",
    "cardano": "Cardano",
}


def get_crypto_price(
    coin_id: str,
    currency: str = "inr",
) -> dict:
    """Get current cryptocurrency price and 24-hour change."""

    api_key = os.getenv("COINGECKO_API_KEY")

    if not api_key:
        raise RuntimeError("COINGECKO_API_KEY must be set.")

    response = requests.get(
        f"{COINGECKO_BASE_URL}/simple/price",
        params={
            "ids": coin_id,
            "vs_currencies": currency,
            "include_24hr_change": "true",
        },
        headers={
            "x-cg-demo-api-key": api_key,
        },
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    if coin_id not in data:
        raise RuntimeError(
            f"CoinGecko returned no data for coin: {coin_id}"
        )

    price_data = data[coin_id]

    return {
        "provider": "coingecko",
        "asset": COIN_NAMES.get(coin_id, coin_id.title()),
        "coin_id": coin_id,
        "currency": currency.upper(),
        "price": price_data.get(currency),
        "change_24h": price_data.get(
            f"{currency}_24h_change"
        ),
        "is_live": True,
    }


def main() -> None:
    data = get_crypto_price("bitcoin", "inr")

    print("Standardized CoinGecko response:")
    print(data)


if __name__ == "__main__":
    main()