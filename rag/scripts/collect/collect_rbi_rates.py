from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup


URL = "https://www.rbi.org.in/"

OUTPUT = Path(
    "rag/data/periodic/rbi/rbi_rates_raw.json"
)

SOURCE_NAME = (
    "Reserve Bank of India, Government of India"
)


def clean_text(value: str) -> str:
    return " ".join(value.split()).strip()


def main() -> None:
    response = requests.get(
        URL,
        headers={"User-Agent": "DhanMitra-RAG-Research/0.1"},
        timeout=30,
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    heading = next(
        (
            x
            for x in soup.find_all("h3")
            if "Policy" in x.get_text(" ", strip=True)
        ),
        None,
    )

    if heading is None:
        raise RuntimeError(
            "Could not find RBI Current Rates section."
        )

    container = heading.parent
    content = clean_text(
        container.get_text(" ", strip=True)
    )

    if not content:
        raise RuntimeError(
            "RBI Current Rates content is empty."
        )

    record = {
        "scheme_name": "RBI Current Rates",
        "source_url": URL,
        "source_name": SOURCE_NAME,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "data_type": "periodic",
        "sections": [
            {
                "heading": "Current Rates",
                "content": content,
            }
        ],
    }

    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT.write_text(
        json.dumps(
            record,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(f"Saved raw RBI rates data to {OUTPUT}")
    print(f"Content length: {len(content)}")


if __name__ == "__main__":
    main()