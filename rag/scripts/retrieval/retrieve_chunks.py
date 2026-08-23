"""Retrieve genuinely relevant RAG chunks from Supabase pgvector."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from supabase import Client, create_client


# Add project root to Python import path.
PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from rag.scripts.context.build_context import build_context


MODEL_NAME = "BAAI/bge-m3"

# Supabase candidate search settings.
MATCH_THRESHOLD = 0.0
MATCH_COUNT = 5

# Retrieval quality settings.
MIN_SIMILARITY = 0.50
RELATIVE_SCORE_RATIO = 0.80

load_dotenv(PROJECT_ROOT / ".env")


def get_supabase_client() -> Client:
    """Create a Supabase client using the service-role key."""

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
        )

    return create_client(url, key)


def filter_relevant_results(results: list[dict]) -> list[dict]:
    """
    Filter retrieved chunks using similarity and document consistency.

    Results from the strongest document are preferred when multiple
    high-quality chunks come from the same document.
    """

    if not results:
        return []

    valid_results = []

    for result in results:
        similarity = result.get("similarity")

        if similarity is None:
            continue

        try:
            similarity = float(similarity)
        except (TypeError, ValueError):
            continue

        result["similarity"] = similarity

        if similarity >= MIN_SIMILARITY:
            valid_results.append(result)

    if not valid_results:
        return []

    # Find the strongest result.
    top_result = max(
        valid_results,
        key=lambda result: result["similarity"],
    )

    top_score = top_result["similarity"]

    # Keep results that are reasonably close to the strongest result.
    relative_threshold = top_score * RELATIVE_SCORE_RATIO

    candidate_results = [
        result
        for result in valid_results
        if result["similarity"] >= relative_threshold
    ]

    if not candidate_results:
        return [top_result]

    # Count how many candidate results belong to each document.
    document_counts: dict[str, int] = {}

    for result in candidate_results:
        document = (
            result.get("document_title")
            or result.get("source_document")
            or "Unknown document"
        )

        document_counts[document] = (
            document_counts.get(document, 0) + 1
        )

    # Identify the strongest document group.
    top_document = max(
        document_counts,
        key=document_counts.get,
    )

    # Keep results from the strongest document.
    same_document_results = [
        result
        for result in candidate_results
        if (
            result.get("document_title")
            or result.get("source_document")
            or "Unknown document"
        ) == top_document
    ]

    # If the strongest document has multiple results,
    # prefer that document and remove isolated unrelated documents.
    if len(same_document_results) >= 2:
        return same_document_results

    # If there is only one result from the strongest document,
    # keep only that strongest result.
    return [top_result]


def retrieve_chunks(
    question: str,
    match_threshold: float = MATCH_THRESHOLD,
    match_count: int = MATCH_COUNT,
) -> list[dict]:
    """Embed the question and retrieve genuinely relevant chunks."""

    model = SentenceTransformer(MODEL_NAME)

    query_embedding = model.encode(
        question,
        normalize_embeddings=True,
    ).tolist()

    supabase = get_supabase_client()

    # match_chunks() is located in the "rag" schema.
    rag_client = supabase.schema("rag")

    response = rag_client.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count,
        },
    ).execute()

    results = response.data or []

    return filter_relevant_results(results)


def main() -> None:
    question = "What is India's fiscal deficit?"

    print(f"Question: {question}")
    print("Searching relevant chunks...")

    results = retrieve_chunks(question)

    print(f"Retrieved relevant chunks: {len(results)}")

    print("\n===== RAG CONTEXT =====\n")

    context = build_context(results)

    print(context)


if __name__ == "__main__":
    main()