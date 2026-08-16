"""Clean raw PMJJBY scheme data without altering its factual content.

The cleaner only normalizes whitespace and removes isolated Unicode replacement
characters when they appear as formatting artifacts. It does not summarize,
infer, or generate scheme information.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


RAW_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "periodic"
    / "government_schemes"
    / "raw"
    / "pmjjby_raw.json"
)
CLEANED_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "periodic"
    / "government_schemes"
    / "cleaned"
    / "pmjjby_cleaned.json"
)
REQUIRED_METADATA = ("scheme_name", "source_url", "source_name", "retrieved_at")


def clean_text(value: str) -> str:
    """Normalize presentation-only artifacts while preserving wording and facts."""
    text = value.replace("\u00a0", " ")
    # Remove U+FFFD only when it stands alone as a whitespace-separated bullet
    # or formatting artifact. Other occurrences are retained for review.
    text = re.sub(r"(?<!\S)\ufffd(?=\s|$)", "", text)
    return re.sub(r"\s+", " ", text).strip()


def load_raw_record(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Raw input file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Raw input is not valid JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise RuntimeError("Raw input must be a JSON object.")
    if not all(isinstance(data.get(field), str) for field in REQUIRED_METADATA):
        raise RuntimeError("Raw input is missing one or more required metadata fields.")
    if not isinstance(data.get("sections"), list):
        raise RuntimeError("Raw input field 'sections' must be a list.")
    return data


def clean_record(raw_record: dict[str, Any]) -> dict[str, Any]:
    """Clean valid raw sections, retaining their original order and content."""
    cleaned_sections: list[dict[str, str]] = []
    for index, section in enumerate(raw_record["sections"], start=1):
        if not isinstance(section, dict):
            raise RuntimeError(f"Section {index} must be an object.")
        heading = section.get("heading")
        content = section.get("content")
        if not isinstance(heading, str) or not isinstance(content, str):
            raise RuntimeError(f"Section {index} must contain string heading and content fields.")

        cleaned_heading = clean_text(heading)
        cleaned_content = clean_text(content)
        if cleaned_heading and cleaned_content:
            cleaned_sections.append(
                {"heading": cleaned_heading, "content": cleaned_content}
            )

    return {
        **{field: raw_record[field] for field in REQUIRED_METADATA},
        "data_type": "periodic",
        "sections": cleaned_sections,
    }


def main() -> int:
    try:
        raw_record = load_raw_record(RAW_PATH)
        cleaned_record = clean_record(raw_record)
        CLEANED_PATH.parent.mkdir(parents=True, exist_ok=True)
        CLEANED_PATH.write_text(
            json.dumps(cleaned_record, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    except RuntimeError as exc:
        print(f"Cleaning failed: {exc}", file=sys.stderr)
        return 1

    print(f"Saved {len(cleaned_record['sections'])} cleaned sections to {CLEANED_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
