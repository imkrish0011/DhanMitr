from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup


URL = "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63394"

OUTPUT = Path(
    "rag/data/periodic/rbi/rbi_vrrr_raw.json"
)

SOURCE_NAME = (
    "Reserve Bank of India, Government of India"
)


def clean_text(value: str) -> str:
    return " ".join(value.split()).strip()


def main() -> None:
    response = requests.get(
        URL,
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=30,
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    tables = soup.find_all("table")

    data_table = None

    for table in tables:
        text = clean_text(table.get_text(" ", strip=True))

        if (
            "Tenor" in text
            and "Notified Amount" in text
            and "Weighted Average Rate" in text
        ):
            data_table = table
            break

    if data_table is None:
        raise RuntimeError(
            "Could not find VRRR auction data table."
        )

    content = clean_text(
        data_table.get_text(" ", strip=True)
    )

    if not content:
        raise RuntimeError(
            "VRRR auction data is empty."
        )

    record = {
        "scheme_name": "RBI VRRR Auction Results",
        "source_url": URL,
        "source_name": SOURCE_NAME,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "data_type": "periodic",
        "sections": [
            {
                "heading": (
                    "VRRR Auction Result - "
                    "August 18, 2026"
                ),
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

    print(
        f"Saved raw RBI VRRR data to {OUTPUT}"
    )
    print(f"Content length: {len(content)}")


if __name__ == "__main__":
    main()