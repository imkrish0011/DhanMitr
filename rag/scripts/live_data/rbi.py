"""Fetch current RBI policy rates from the official RBI website."""

from __future__ import annotations

import re

import requests
from bs4 import BeautifulSoup


RBI_URL = (
    "https://m.rbi.org.in/"
    "Scripts/NotificationUser.aspx?Id=426&Mode=0"
)


def get_rbi_policy_rates() -> dict:
    """Fetch and extract current RBI policy rates."""

    response = requests.get(
        RBI_URL,
        timeout=15,
        headers={
            "User-Agent": "Mozilla/5.0",
        },
    )

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    text = soup.get_text(" ", strip=True)

    patterns = {
        "repo_rate": (
            r"Policy\s+Repo\s+Rate\s*:\s*"
            r"([0-9]+(?:\.[0-9]+)?)"
        ),
        "sdf_rate": (
            r"Standing\s+Deposit\s+Facility\s+Rate\s*:\s*"
            r"([0-9]+(?:\.[0-9]+)?)"
        ),
        "msf_rate": (
            r"Marginal\s+Standing\s+Facility\s+Rate\s*:\s*"
            r"([0-9]+(?:\.[0-9]+)?)"
        ),
        "bank_rate": (
            r"Bank\s+Rate\s*:\s*"
            r"([0-9]+(?:\.[0-9]+)?)"
        ),
        "reverse_repo_rate": (
            r"Fixed\s+Reverse\s+Repo\s+Rate\s*:\s*"
            r"([0-9]+(?:\.[0-9]+)?)"
        ),
    }

    rates = {}

    for name, pattern in patterns.items():
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            rates[name] = float(match.group(1))

    required_rates = [
        "repo_rate",
        "sdf_rate",
        "msf_rate",
        "bank_rate",
        "reverse_repo_rate",
    ]

    missing_rates = [
        rate
        for rate in required_rates
        if rate not in rates
    ]

    if missing_rates:
        raise RuntimeError(
            "Could not extract RBI rates: "
            + ", ".join(missing_rates)
        )

    return {
        "provider": "rbi",
        "source": "Reserve Bank of India",
        "source_url": RBI_URL,
        "data_type": "live",
        "currency": "INR",
        "rates": rates,
        "is_live": True,
    }


def main() -> None:
    data = get_rbi_policy_rates()

    print("Current RBI policy rates:")
    print()

    for name, value in data["rates"].items():
        print(f"{name}: {value}%")


if __name__ == "__main__":
    main()