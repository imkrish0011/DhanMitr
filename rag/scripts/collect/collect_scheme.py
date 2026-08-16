"""Collect raw scheme content from an official webpage.

This utility only extracts source text. It does not summarize, infer, generate,
or embed information.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup, Tag


HEADERS = {
    "User-Agent": "DhanMitra-RAG-Research/0.1 (official-source collection)",
    "Accept": "text/html,application/xhtml+xml",
}
HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Collect raw official scheme content.")
    parser.add_argument("--scheme-name", required=True, help="Scheme name to store in metadata.")
    parser.add_argument("--url", required=True, help="Official source webpage URL.")
    parser.add_argument("--output", required=True, type=Path, help="Output JSON file path.")
    parser.add_argument(
        "--source-name",
        help="Official publisher name. Defaults to the URL host when omitted.",
    )
    return parser.parse_args()


def fetch_page(url: str) -> str:
    """Fetch a page while preserving TLS verification and reporting failures."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
    except requests.Timeout as exc:
        raise RuntimeError(f"Timed out while fetching {url}") from exc
    except requests.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else "unknown"
        raise RuntimeError(f"Official source returned HTTP {status} for {url}") from exc
    except requests.RequestException as exc:
        raise RuntimeError(f"Could not fetch {url}: {exc}") from exc
    return response.text


def find_content_root(soup: BeautifulSoup) -> Tag:
    """Prefer a page's main content area over navigation, headers, and footers."""
    for selector in ("main", "#main-content", "#block-system-main", ".region-content"):
        root = soup.select_one(selector)
        if isinstance(root, Tag):
            return root

    body = soup.body
    if not isinstance(body, Tag):
        raise RuntimeError("The official page did not contain an HTML body.")
    for unwanted in body.select("header, footer, nav, script, style, noscript"):
        unwanted.decompose()
    return body


def text_from(element: Tag) -> str:
    """Normalize whitespace only; source wording is otherwise untouched."""
    return " ".join(element.get_text(" ", strip=True).split())


def extract_sections(root: Tag) -> list[dict[str, str]]:
    """Extract each heading/question and sibling content before the next heading."""
    sections: list[dict[str, str]] = []
    for heading in root.find_all(["h2", "h3", "h4", "h5", "h6"]):
        heading_text = text_from(heading)
        if not heading_text:
            continue

        parts: list[str] = []
        for sibling in heading.next_siblings:
            if not isinstance(sibling, Tag):
                continue
            if sibling.name in HEADING_TAGS:
                break
            if sibling.name in {"script", "style", "noscript"}:
                continue
            sibling_text = text_from(sibling)
            if sibling_text:
                parts.append(sibling_text)

        content = "\n".join(parts)
        if content:
            sections.append({"heading": heading_text, "content": content})
    return sections


def build_record(
    html: str, scheme_name: str, source_url: str, source_name: str
) -> dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")
    sections = extract_sections(find_content_root(soup))
    if not sections:
        raise RuntimeError("No headed scheme content was found on the official page.")
    return {
        "scheme_name": scheme_name,
        "source_url": source_url,
        "source_name": source_name,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "sections": sections,
    }


def main() -> int:
    args = parse_args()
    source_name = args.source_name or urlparse(args.url).netloc
    if not source_name:
        print("Collection failed: URL must include a valid host.", file=sys.stderr)
        return 1

    try:
        record = build_record(fetch_page(args.url), args.scheme_name, args.url, source_name)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(
            json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    except RuntimeError as exc:
        print(f"Collection failed: {exc}", file=sys.stderr)
        return 1

    print(f"Saved {len(record['sections'])} raw sections to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
