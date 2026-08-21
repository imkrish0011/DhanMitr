"""Retrieve relevant RAG chunks from Supabase pgvector."""

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

MATCH_THRESHOLD = 0.0
MATCH_COUNT = 5

load_dotenv(PROJECT_ROOT / ".env")


def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
        )

    return create_client(url, key)


def retrieve_chunks(
    question: str,
    match_threshold: float = MATCH_THRESHOLD,
    match_count: int = MATCH_COUNT,
) -> list[dict]:
    """Embed the question and retrieve relevant chunks from Supabase."""

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

    return response.data or []


def main() -> None:
    question = "What is India's fiscal deficit?"

    print(f"Question: {question}")
    print("Searching relevant chunks...")

    results = retrieve_chunks(question)

    print(f"Retrieved chunks: {len(results)}")

    print("\n===== RAG CONTEXT =====\n")

    context = build_context(results)

    print(context)


if __name__ == "__main__":
    main()