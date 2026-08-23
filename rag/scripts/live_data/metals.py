"""Fetch live gold and silver prices using Metals.Dev."""

from __future__ import annotations

import os

import requests
from dotenv import load_dotenv


load_dotenv()

METALS_URL = "https://api.metals.dev/v1/latest"


def get_metals_prices() -> dict:
    """Fetch latest gold and silver prices in INR per gram."""

    api_key = os.getenv("METALS_DEV_API_KEY")

    if not api_key:
        raise RuntimeError(
            "METALS_DEV_API_KEY is not set in .env"
        )

    response = requests.get(
        METALS_URL,
        params={
            "api_key": api_key,
            "currency": "INR",
            "unit": "g",
        },
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    metals = data.get("metals", {})

    if "gold" not in metals or "silver" not in metals:
        raise RuntimeError(
            f"Gold/Silver data missing: {data}"
        )

    return {
        "provider": "metals_dev",
        "currency": data.get("currency", "INR"),
        "unit": data.get("unit", "g"),
        "gold_price": float(metals["gold"]),
        "silver_price": float(metals["silver"]),
        "timestamp": data.get("timestamps", {}).get("metal"),
        "is_live": True,
    }


def main() -> None:
    data = get_metals_prices()

    print("Live precious metal prices:")
    print(f"Gold: ₹{data['gold_price']} per {data['unit']}")
    print(f"Silver: ₹{data['silver_price']} per {data['unit']}")
    print(f"Timestamp: {data['timestamp']}")
    print(f"Provider: {data['provider']}")


if __name__ == "__main__":
    main()