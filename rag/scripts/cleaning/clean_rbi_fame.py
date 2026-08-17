"""Clean RBI FAME PDF extraction artifacts while retaining page-level source text."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


EXTRACTED_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "static"
    / "financial_education"
    / "official"
    / "rbi"
    / "raw"
    / "fame202426022024_extracted.json"
)
CLEANED_PATH = EXTRACTED_PATH.parent.parent / "cleaned" / "fame_cleaned.json"
REQUIRED_METADATA = (
    "document_title",
    "source_organization",
    "source_url",
    "retrieved_at",
    "page_count",
)


def clean_text(text: str) -> str:
    """Remove whitespace-only extraction artifacts without changing source wording."""
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\u00a0", " ")
    cleaned_lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]

    # Keep line breaks, which retain headings, lists, and source layout, but
    # reduce runs of blank lines introduced by the PDF text extractor.
    result: list[str] = []
    previous_blank = False
    for line in cleaned_lines:
        is_blank = not line
        if is_blank and previous_blank:
            continue
        result.append(line)
        previous_blank = is_blank
    return "\n".join(result).strip()


def load_extracted_document(path: Path) -> dict[str, Any]:
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Extracted input file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Extracted input is not valid JSON: {exc}") from exc

    if not isinstance(document, dict):
        raise RuntimeError("Extracted input must be a JSON object.")
    if not all(field in document for field in REQUIRED_METADATA):
        raise RuntimeError("Extracted input is missing required source metadata.")
    if not isinstance(document["pages"], list):
        raise RuntimeError("Extracted input field 'pages' must be a list.")
    return document


def clean_document(extracted: dict[str, Any]) -> dict[str, Any]:
    """Preserve every source page and its number while cleaning only its text format."""
    pages: list[dict[str, Any]] = []
    for index, page in enumerate(extracted["pages"], start=1):
        if not isinstance(page, dict):
            raise RuntimeError(f"Extracted page record {index} must be an object.")
        page_number, text = page.get("page_number"), page.get("text")
        if not isinstance(page_number, int) or not isinstance(text, str):
            raise RuntimeError(
                f"Extracted page record {index} must contain integer page_number and string text."
            )
        pages.append({"page_number": page_number, "text": clean_text(text)})

    return {
        **{field: extracted[field] for field in REQUIRED_METADATA},
        "data_type": "static",
        "pages": pages,
    }


def verify(extracted: dict[str, Any], cleaned: dict[str, Any]) -> tuple[int, int, int]:
    """Ensure metadata and page numbers were preserved before saving the result."""
    if any(cleaned.get(field) != extracted[field] for field in REQUIRED_METADATA):
        raise RuntimeError("Required source metadata was not preserved.")
    source_numbers = [page["page_number"] for page in extracted["pages"]]
    cleaned_numbers = [page["page_number"] for page in cleaned["pages"]]
    if source_numbers != cleaned_numbers:
        raise RuntimeError("Page numbers were not preserved exactly.")
    empty_records = sum(not page["text"] for page in cleaned["pages"])
    return len(extracted["pages"]), len(cleaned["pages"]), empty_records


def main() -> int:
    try:
        extracted = load_extracted_document(EXTRACTED_PATH)
        cleaned = clean_document(extracted)
        extracted_count, cleaned_count, empty_records = verify(extracted, cleaned)
        CLEANED_PATH.parent.mkdir(parents=True, exist_ok=True)
        CLEANED_PATH.write_text(
            json.dumps(cleaned, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    except RuntimeError as exc:
        print(f"Cleaning failed: {exc}", file=sys.stderr)
        return 1

    print(f"Extracted records: {extracted_count}")
    print(f"Cleaned records: {cleaned_count}")
    print(f"Empty cleaned records: {empty_records}")
    print("Required metadata and page numbers preserved: yes")
    print(f"Saved cleaned text to {CLEANED_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
