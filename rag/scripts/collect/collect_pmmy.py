from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup


URL = "https://financialservices.gov.in/pradhan-mantri-mudra-yojana-pmmy"

OUTPUT = Path(
    "rag/data/periodic/government_schemes/raw/pmmy_raw.json"
)

SOURCE_NAME = (
    "Department of Financial Services, Ministry of Finance, "
    "Government of India"
)


def main() -> None:
    response = requests.get(
        URL,
        headers={
            "User-Agent": "DhanMitra-RAG-Research/0.1"
        },
        timeout=30,
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    marker = soup.find(
        string=lambda text: text
        and "Features:" in text
    )

    if marker is None:
        raise RuntimeError(
            "Could not find the PMMY content marker."
        )

    container = marker.parent.parent.parent
    content = container.get_text("\n", strip=True)

    if not content:
        raise RuntimeError(
            "PMMY content container was empty."
        )

    record = {
        "scheme_name": "Pradhan Mantri MUDRA Yojana (PMMY)",
        "source_url": URL,
        "source_name": SOURCE_NAME,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "data_type": "periodic",
        "sections": [
            {
                "heading": "Pradhan Mantri MUDRA Yojana (PMMY)",
                "content": content,
            }
        ],
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT.write_text(
        json.dumps(
            record,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(f"Saved raw PMMY data to {OUTPUT}")
    print(f"Content length: {len(content)} characters")


if __name__ == "__main__":
    main()