"""Collect raw PMSBY scheme content from the official DFS webpage only."""

from __future__ import annotations

import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup, Tag


# The supplied www host has a TLS hostname-certificate mismatch. This is the
# official canonical DFS host for the same PMSBY page, with TLS verification kept on.
SOURCE_URL = "https://financialservices.gov.in/pmsby"
SOURCE_NAME = "Department of Financial Services, Ministry of Finance, Government of India"
OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "periodic"
    / "government_schemes"
    / "raw"
    / "pmsby_raw.json"
)
HEADERS = {
    "User-Agent": "DhanMitra-RAG-Research/0.1 (official-source collection)",
    "Accept": "text/html,application/xhtml+xml",
}
HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6"}


def fetch_page(url: str) -> str:
    """Fetch the official PMSBY page with TLS verification enabled."""
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
    """Prefer source content and exclude site navigation and footer material."""
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


def clean_text(element: Tag) -> str:
    """Normalize whitespace only; preserve official wording and content."""
    return " ".join(element.get_text(" ", strip=True).split())


def extract_sections(root: Tag) -> list[dict[str, str]]:
    """Pair every source heading/question with content until the next heading."""
    sections: list[dict[str, str]] = []
    for heading in root.find_all(["h2", "h3", "h4", "h5", "h6"]):
        heading_text = clean_text(heading)
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
            text = clean_text(sibling)
            if text:
                parts.append(text)

        content = "\n".join(parts)
        if content:
            sections.append({"heading": heading_text, "content": content})
    return sections


def extract_scheme_name(root: Tag, soup: BeautifulSoup) -> str:
    """Read the displayed page title rather than generating a scheme name."""
    title = root.find("h1") or soup.find("h1")
    if isinstance(title, Tag):
        name = clean_text(title)
        if name:
            return name
    raise RuntimeError("Could not find a scheme name (H1) on the official page.")


def build_record(html: str) -> dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")
    root = find_content_root(soup)
    sections = extract_sections(root)
    if not sections:
        raise RuntimeError("No headed PMSBY source content was found on the official page.")
    return {
        "scheme_name": extract_scheme_name(root, soup),
        "source_url": SOURCE_URL,
        "source_name": SOURCE_NAME,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "sections": sections,
    }


def main() -> int:
    try:
        record = build_record(fetch_page(SOURCE_URL))
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_PATH.write_text(
            json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    except RuntimeError as exc:
        print(f"Collection failed: {exc}", file=sys.stderr)
        return 1

    print(f"Saved {len(record['sections'])} raw PMSBY sections to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
