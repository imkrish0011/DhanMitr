from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup, Tag


URL = "https://financialservices.gov.in/national-pension-system"

OUTPUT = Path(
    "rag/data/periodic/government_schemes/raw/nps_raw.json"
)

SOURCE_NAME = (
    "Department of Financial Services, Ministry of Finance, "
    "Government of India"
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

    headings = soup.find_all("h3")
    sections = []

    for index, heading in enumerate(headings):
        question = clean_text(heading.get_text(" ", strip=True))

        if not question:
            continue

        answer_parts = []

        for sibling in heading.next_siblings:
            if isinstance(sibling, Tag) and sibling.name == "h3":
                break

            if isinstance(sibling, Tag):
                text = clean_text(sibling.get_text(" ", strip=True))
                if text:
                    answer_parts.append(text)

        answer = clean_text(" ".join(answer_parts))

        if answer:
            sections.append(
                {
                    "heading": question,
                    "content": answer,
                }
            )

    if not sections:
        raise RuntimeError(
            "No NPS question-answer sections were found."
        )

    record = {
        "scheme_name": "National Pension System (NPS)",
        "source_url": URL,
        "source_name": SOURCE_NAME,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "data_type": "periodic",
        "sections": sections,
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

    print(f"Saved raw NPS data to {OUTPUT}")
    print(f"Sections: {len(sections)}")
    print(
        f"Empty: "
        f"{sum(1 for x in sections if not x['content'].strip())}"
    )
    print(
        f"Total characters: "
        f"{sum(len(x['content']) for x in sections)}"
    )


if __name__ == "__main__":
    main()