"""Extract RBI Financial Awareness Messages (FAME) PDF text page by page.

The original PDF is read only. This script preserves extracted source text and
page boundaries without cleaning, summarizing, or generating content.
"""

from __future__ import annotations

import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from pypdf import PdfReader


DOCUMENT_TITLE = "Financial Awareness Messages (FAME)"
SOURCE_ORGANIZATION = "Reserve Bank of India"
SOURCE_URL = "https://www.rbi.org.in/commonperson/images/FAME202426022024.pdf"
PDF_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "static"
    / "financial_education"
    / "official"
    / "rbi"
    / "FAME202426022024.pdf"
)
OUTPUT_PATH = PDF_PATH.parent / "raw" / "fame202426022024_extracted.json"


def extract_document(pdf_path: Path) -> tuple[dict[str, Any], list[int], list[int]]:
    """Return page-preserved text plus pages with missing or unusually short text."""
    try:
        reader = PdfReader(pdf_path)
    except FileNotFoundError as exc:
        raise RuntimeError(f"Source PDF not found: {pdf_path}") from exc
    except Exception as exc:
        raise RuntimeError(f"Could not read source PDF: {exc}") from exc

    if reader.is_encrypted:
        raise RuntimeError("Source PDF is encrypted and cannot be extracted.")

    pages: list[dict[str, Any]] = []
    failed_pages: list[int] = []
    short_pages: list[int] = []
    for page_number, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text(extraction_mode="layout") or ""
        except Exception as exc:
            failed_pages.append(page_number)
            pages.append({"page_number": page_number, "text": "", "error": str(exc)})
            continue

        if not text.strip():
            failed_pages.append(page_number)
        elif len(text.strip()) < 80:
            # A short page can be legitimate, but is flagged for manual review.
            short_pages.append(page_number)
        pages.append({"page_number": page_number, "text": text})

    document = {
        "document_title": DOCUMENT_TITLE,
        "source_organization": SOURCE_ORGANIZATION,
        "source_url": SOURCE_URL,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "page_count": len(reader.pages),
        "pages": pages,
    }
    return document, failed_pages, short_pages


def main() -> int:
    try:
        document, failed_pages, short_pages = extract_document(PDF_PATH)
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_PATH.write_text(
            json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    except RuntimeError as exc:
        print(f"Extraction failed: {exc}", file=sys.stderr)
        return 1

    print(f"Processed {document['page_count']} pages.")
    print(f"Saved extracted text to {OUTPUT_PATH}")
    print(f"Pages with failed or empty text extraction: {failed_pages or 'none'}")
    print(f"Pages with unusually short text (manual review): {short_pages or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
