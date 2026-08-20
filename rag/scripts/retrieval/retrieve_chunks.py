"""Retrieve relevant RAG chunks from Supabase pgvector."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from supabase import Client, create_client


MODEL_NAME = "BAAI/bge-m3"

MATCH_THRESHOLD = 0.0
MATCH_COUNT = 5

load_dotenv()


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
    model = SentenceTransformer(MODEL_NAME)

    query_embedding = model.encode(
        question,
        normalize_embeddings=True,
    ).tolist()

    supabase = get_supabase_client()

    # The match_chunks function is inside the "rag" schema.
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

    print(f"Results: {len(results)}")

    for index, result in enumerate(results, start=1):
        print()
        print(f"--- Result {index} ---")
        print("Chunk ID:", result.get("chunk_id"))
        print("Source:", result.get("source_name"))
        print("Similarity:", result.get("similarity"))
        print("Text:", result.get("chunk_text", "")[:500])


if __name__ == "__main__":
    main()