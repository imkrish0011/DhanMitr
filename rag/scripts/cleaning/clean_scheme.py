"""Clean a raw government-scheme JSON record without changing source facts."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


REQUIRED_METADATA = ("scheme_name", "source_url", "source_name", "retrieved_at")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Clean a raw government-scheme JSON record.")
    parser.add_argument("raw_input", type=Path, help="Raw JSON file to read without modifying.")
    parser.add_argument("output", type=Path, help="Cleaned JSON file to create or replace.")
    return parser.parse_args()


def clean_text(value: str) -> str:
    """Remove presentation-only artifacts, retaining source wording and facts."""
    text = value.replace("\u00a0", " ")
    # Remove U+FFFD only when it is isolated as a formatting/bullet artifact.
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
    """Retain all valid non-empty heading/content sections in their source order."""
    sections: list[dict[str, str]] = []
    for index, section in enumerate(raw_record["sections"], start=1):
        if not isinstance(section, dict):
            raise RuntimeError(f"Section {index} must be an object.")
        heading, content = section.get("heading"), section.get("content")
        if not isinstance(heading, str) or not isinstance(content, str):
            raise RuntimeError(f"Section {index} must contain string heading and content fields.")

        cleaned_heading, cleaned_content = clean_text(heading), clean_text(content)
        if cleaned_heading and cleaned_content:
            sections.append({"heading": cleaned_heading, "content": cleaned_content})

    return {
        **{field: raw_record[field] for field in REQUIRED_METADATA},
        "data_type": "periodic",
        "sections": sections,
    }


def main() -> int:
    args = parse_args()
    try:
        cleaned = clean_record(load_raw_record(args.raw_input))
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(
            json.dumps(cleaned, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    except RuntimeError as exc:
        print(f"Cleaning failed: {exc}", file=sys.stderr)
        return 1

    print(f"Saved {len(cleaned['sections'])} cleaned sections to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
