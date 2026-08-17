"""Create section-aware, source-preserving chunks from cleaned RBI FAME text."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any


INPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "static"
    / "financial_education"
    / "official"
    / "rbi"
    / "cleaned"
    / "fame_cleaned.json"
)
OUTPUT_PATH = Path(__file__).resolve().parents[2] / "processed" / "chunks" / "rbi_fame_chunks.json"

DIVIDER_PAGES = {1, 6, 17, 27, 36, 50}
EXCLUDED_TOPIC_PAGES = DIVIDER_PAGES | {5, 59}
PROVENANCE_PAGE = 2
CONTACT_PAGE = 60
MAX_CHUNK_CHARS = 2_400
OVERLAP_BLOCKS = 1
MESSAGE_PATTERN = re.compile(r"^Message\s+\d+\b", re.IGNORECASE)


@dataclass
class Block:
    text: str
    page_number: int


@dataclass
class Section:
    heading: str
    blocks: list[Block]
    requires_layout_review: bool = False


def load_document(path: Path) -> dict[str, Any]:
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Cleaned input file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Cleaned input is not valid JSON: {exc}") from exc

    required = (
        "document_title",
        "source_organization",
        "source_url",
        "retrieved_at",
        "data_type",
        "pages",
    )
    if not isinstance(document, dict) or not all(field in document for field in required):
        raise RuntimeError("Cleaned input is missing required document metadata.")
    if not isinstance(document["pages"], list):
        raise RuntimeError("Cleaned input field 'pages' must be a list.")
    return document


def remove_layout_artifacts(text: str, page_number: int) -> str:
    """Remove only known non-content layout artifacts from chunk text."""
    printed_page_number = str(page_number - 6) if 7 <= page_number <= 59 else None
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped == printed_page_number:
            continue  # printed page number; retain all other numeric source content
        if page_number == 48 and stripped == "l r de >":
            continue  # PDF extraction of a decorative graphic, not source prose
        lines.append(line)
    return "\n".join(lines).strip()


def blocks_from_page(page: dict[str, Any]) -> list[Block]:
    page_number, text = page.get("page_number"), page.get("text")
    if not isinstance(page_number, int) or not isinstance(text, str):
        raise RuntimeError("Every cleaned page must contain integer page_number and string text.")
    text = remove_layout_artifacts(text, page_number)
    return [
        Block(text=block.strip(), page_number=page_number)
        for block in re.split(r"\n\s*\n", text)
        if block.strip()
    ]


def heading_from_blocks(blocks: list[Block], fallback: str) -> str:
    if not blocks:
        return fallback
    first = blocks[0].text.replace("\n", " ").strip()
    return first if len(first) <= 180 else fallback


def build_sections(document: dict[str, Any]) -> list[Section]:
    """Group all Message N content, including continuation pages, into sections."""
    sections: list[Section] = []
    current: Section | None = None

    for page in document["pages"]:
        page_number = page["page_number"]
        if page_number in EXCLUDED_TOPIC_PAGES or page_number in {PROVENANCE_PAGE, CONTACT_PAGE}:
            if current is not None:
                sections.append(current)
                current = None
            continue

        page_blocks = blocks_from_page(page)
        if not page_blocks:
            continue
        starts_message = MESSAGE_PATTERN.match(page_blocks[0].text.replace("\n", " "))
        if starts_message:
            if current is not None:
                sections.append(current)
            current = Section(
                heading=heading_from_blocks(page_blocks, "RBI FAME message"),
                blocks=page_blocks,
            )
        else:
            if current is None:
                current = Section(
                    heading=heading_from_blocks(page_blocks, "RBI FAME introductory material"),
                    blocks=page_blocks,
                    requires_layout_review=page_number in {3, 4},
                )
            else:
                current.blocks.extend(page_blocks)
                if page_number in {3, 4}:
                    current.requires_layout_review = True

    if current is not None:
        sections.append(current)
    return sections


def split_section(section: Section) -> list[list[Block]]:
    """Split only at paragraph/list-block boundaries, retaining limited overlap."""
    groups: list[list[Block]] = []
    current: list[Block] = []
    current_length = 0
    for block in section.blocks:
        block_length = len(block.text) + (2 if current else 0)
        if current and current_length + block_length > MAX_CHUNK_CHARS:
            groups.append(current)
            overlap = current[-OVERLAP_BLOCKS:]
            current = overlap.copy()
            current_length = sum(len(item.text) for item in current) + 2 * max(len(current) - 1, 0)
        current.append(block)
        current_length += len(block.text) + (2 if len(current) > 1 else 0)
    if current:
        groups.append(current)
    return groups


def make_chunk(
    document: dict[str, Any],
    chunk_id: str,
    heading: str,
    blocks: list[Block],
    *,
    retrieval_eligible: bool,
    chunk_type: str,
    requires_layout_review: bool = False,
) -> dict[str, Any]:
    page_numbers = sorted({block.page_number for block in blocks})
    return {
        "chunk_id": chunk_id,
        "section": heading,
        "source_document": document["document_title"],
        "document_title": document["document_title"],
        "source_organization": document["source_organization"],
        "source_url": document["source_url"],
        "retrieved_at": document["retrieved_at"],
        "data_type": document["data_type"],
        "page_numbers": page_numbers,
        "page_start": page_numbers[0],
        "page_end": page_numbers[-1],
        "chunk_type": chunk_type,
        "retrieval_eligible": retrieval_eligible,
        "requires_layout_review": requires_layout_review,
        "text": "\n\n".join(block.text for block in blocks),
    }


def make_chunks(document: dict[str, Any]) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    for section in build_sections(document):
        for part_number, block_group in enumerate(split_section(section), start=1):
            chunks.append(
                make_chunk(
                    document,
                    f"rbi-fame-{len(chunks) + 1:03d}",
                    section.heading,
                    block_group,
                    retrieval_eligible=True,
                    chunk_type="financial_education",
                    requires_layout_review=section.requires_layout_review,
                )
            )

    # Keep required source/provenance material separate and out of topical retrieval.
    for page_number, section_name, chunk_type in (
        (PROVENANCE_PAGE, "Disclaimer and publication information", "provenance"),
        (CONTACT_PAGE, "Reserve Bank of India contact information", "source_contact"),
    ):
        page = next(page for page in document["pages"] if page["page_number"] == page_number)
        blocks = blocks_from_page(page)
        if blocks:
            chunks.append(
                make_chunk(
                    document,
                    f"rbi-fame-{len(chunks) + 1:03d}",
                    section_name,
                    blocks,
                    retrieval_eligible=False,
                    chunk_type=chunk_type,
                )
            )
    return chunks


def validate_chunks(chunks: list[dict[str, Any]]) -> dict[str, Any]:
    required = (
        "chunk_id",
        "section",
        "source_document",
        "document_title",
        "source_organization",
        "source_url",
        "retrieved_at",
        "data_type",
        "page_numbers",
        "page_start",
        "page_end",
        "text",
    )
    missing_metadata = [
        chunk["chunk_id"] for chunk in chunks if any(not chunk.get(field) for field in required)
    ]
    empty_chunks = [chunk["chunk_id"] for chunk in chunks if not chunk["text"].strip()]
    duplicate_texts = [
        text for text, count in Counter(chunk["text"].strip() for chunk in chunks).items() if count > 1
    ]
    lengths = [len(chunk["text"]) for chunk in chunks]
    topical_pages = sorted(
        {
            page
            for chunk in chunks
            if chunk["retrieval_eligible"]
            for page in chunk["page_numbers"]
        }
    )
    return {
        "total_chunks": len(chunks),
        "min_chunk_length": min(lengths, default=0),
        "max_chunk_length": max(lengths, default=0),
        "average_chunk_length": round(sum(lengths) / len(lengths), 1) if lengths else 0,
        "topical_page_coverage": topical_pages,
        "multi_page_chunks": [
            chunk["chunk_id"] for chunk in chunks if chunk["page_start"] != chunk["page_end"]
        ],
        "missing_metadata_chunks": missing_metadata,
        "empty_chunks": empty_chunks,
        "duplicate_chunk_text_count": len(duplicate_texts),
        "requires_layout_review": [
            chunk["chunk_id"] for chunk in chunks if chunk["requires_layout_review"]
        ],
    }


def main() -> int:
    try:
        document = load_document(INPUT_PATH)
        chunks = make_chunks(document)
        validation = validate_chunks(chunks)
        if validation["missing_metadata_chunks"] or validation["empty_chunks"]:
            raise RuntimeError("Chunk validation found missing metadata or empty chunks.")
        output = {
            "source_document": document["document_title"],
            "source_organization": document["source_organization"],
            "source_url": document["source_url"],
            "retrieved_at": document["retrieved_at"],
            "data_type": document["data_type"],
            "excluded_from_topical_retrieval_pages": sorted(EXCLUDED_TOPIC_PAGES),
            "chunks": chunks,
            "validation": validation,
        }
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except RuntimeError as exc:
        print(f"Chunking failed: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(validation, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
