from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from pypdf import PdfReader


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract text from an official PDF into page-level JSON."
    )
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--document-title", required=True)
    parser.add_argument("--source-name", required=True)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--data-type", default="periodic")

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    reader = PdfReader(input_path)

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""

        pages.append(
            {
                "page_number": page_number,
                "text": text.strip(),
            }
        )

    record = {
        "document_title": args.document_title,
        "source_name": args.source_name,
        "source_url": args.source_url,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "data_type": args.data_type,
        "pages": pages,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)

    output_path.write_text(
        json.dumps(record, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Saved {len(pages)} pages to {output_path}")
    print(
        f"Pages with text: "
        f"{sum(1 for page in pages if page['text'])}"
    )


if __name__ == "__main__":
    main()