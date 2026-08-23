"""Create chunks from the PM SVANidhi page-based cleaned JSON."""

from __future__ import annotations

import json
import sys
from pathlib import Path


MAX_CHUNK_CHARS = 2000


def load_data(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def split_text(text: str) -> list[str]:
    words = text.split()
    chunks = []
    current = ""

    for word in words:
        if len(current) + len(word) + 1 > MAX_CHUNK_CHARS:
            if current:
                chunks.append(current.strip())
            current = word
        else:
            current += " " + word

    if current:
        chunks.append(current.strip())

    return chunks


def create_chunks(data: dict) -> list[dict]:
    chunks = []

    for page in data.get("pages", []):
        page_number = page.get("page_number")
        page_text = (page.get("text") or "").strip()

        if not page_text:
            continue

        text_chunks = split_text(page_text)

        for text in text_chunks:
            chunks.append(
                {
                    "chunk_id": (
                        f"{data['document_title']}-"
                        f"{len(chunks) + 1:03d}"
                    ),
                    "section": f"Page {page_number}",
                    "source_document": data["document_title"],
                    "source_name": data["source_name"],
                    "source_url": data["source_url"],
                    "retrieved_at": data["retrieved_at"],
                    "data_type": data["data_type"],
                    "text": text,
                }
            )

    return chunks


def main() -> int:
    if len(sys.argv) != 3:
        print(
            "Usage: python chunk_pm_svanidhi.py "
            "input.json output.json"
        )
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    data = load_data(input_path)
    chunks = create_chunks(data)

    if not chunks:
        raise RuntimeError("No valid PM SVANidhi chunks were created.")

    output = {
        "source_document": data["document_title"],
        "source_name": data["source_name"],
        "source_url": data["source_url"],
        "retrieved_at": data["retrieved_at"],
        "data_type": data["data_type"],
        "chunks": chunks,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)

    output_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("Created chunks:", len(chunks))
    print("Saved to:", output_path)

    return 0

if __name__ == "__main__":
    raise SystemExit(main())