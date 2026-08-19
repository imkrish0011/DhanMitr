"""Ingest pre-computed BGE-M3 embeddings into Supabase (rag schema).

Reads `rag/processed/embeddings/rag_embeddings.json`, validates dataset integrity,
and idempotently populates `rag.documents` and `rag.chunks` using the official
Supabase Python client.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from supabase import Client, create_client

# Set up logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

EXPECTED_EMBEDDING_DIM = 1024
DEFAULT_BATCH_SIZE = 10
DEFAULT_FILE_PATH = Path("rag/processed/embeddings/rag_embeddings.json")


def load_environment() -> tuple[str, str]:
    """Load and return Supabase connection parameters from environment variables."""
    # Attempt loading from standard env file locations if present
    possible_env_paths = [
        Path(".env"),
        Path(".env.local"),
        Path("backend/.env"),
        Path("ui/.env.local"),
        Path("../.env"),
        Path("../../.env"),
    ]
    for env_path in possible_env_paths:
        if env_path.is_file():
            load_dotenv(dotenv_path=env_path, override=False)

    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_SERVICE_KEY")
    )

    if not supabase_url or not service_key:
        raise ValueError(
            "Missing Supabase credentials. Ensure SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) "
            "and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) are set in your "
            "environment or .env file."
        )

    return supabase_url, service_key


def get_supabase_client(url: str, key: str) -> Client:
    """Create and return a Supabase client configured with the service-role key."""
    return create_client(url, key)


def read_and_validate_dataset(file_path: Path) -> dict[str, Any]:
    """Read the embeddings JSON file and perform strict integrity validation."""
    if not file_path.exists():
        raise FileNotFoundError(f"Embeddings file not found at: {file_path}")

    logger.info("Reading embeddings file from: %s", file_path)
    try:
        raw_text = file_path.read_text(encoding="utf-8")
        data = json.loads(raw_text)
    except Exception as exc:
        raise ValueError(f"Failed to parse JSON file {file_path}: {exc}") from exc

    # 1. Top-level field validation
    embedding_dim = data.get("embedding_dimension")
    if embedding_dim != EXPECTED_EMBEDDING_DIM:
        raise ValueError(
            f"Invalid embedding_dimension: expected {EXPECTED_EMBEDDING_DIM}, got {embedding_dim}"
        )

    records = data.get("records")
    if not isinstance(records, list) or len(records) == 0:
        raise ValueError("Dataset 'records' must be a non-empty list.")

    stated_count = data.get("count")
    if stated_count != len(records):
        raise ValueError(
            f"Record count mismatch: 'count' field is {stated_count}, "
            f"but found {len(records)} records in 'records' list."
        )

    # 2. Record-level validation
    seen_chunk_ids: set[str] = set()
    for idx, record in enumerate(records):
        chunk_id = record.get("chunk_id")
        if not chunk_id or not isinstance(chunk_id, str) or not chunk_id.strip():
            raise ValueError(f"Record at index {idx} is missing a valid non-empty 'chunk_id'.")

        if chunk_id in seen_chunk_ids:
            raise ValueError(f"Duplicate 'chunk_id' detected: '{chunk_id}' at index {idx}.")
        seen_chunk_ids.add(chunk_id)

        text = record.get("text")
        if not text or not isinstance(text, str) or not text.strip():
            raise ValueError(f"Record '{chunk_id}' (index {idx}) has missing or empty 'text'.")

        embedding = record.get("embedding")
        if not isinstance(embedding, list) or len(embedding) != EXPECTED_EMBEDDING_DIM:
            actual_len = len(embedding) if isinstance(embedding, list) else type(embedding)
            raise ValueError(
                f"Record '{chunk_id}' embedding must have exactly {EXPECTED_EMBEDDING_DIM} values, "
                f"got {actual_len}."
            )

        # Quick numeric check
        if not all(isinstance(v, (int, float)) for v in embedding[:5]):
            raise ValueError(f"Record '{chunk_id}' contains non-numeric values in embedding vector.")

    return data


def group_documents(records: list[dict[str, Any]], embedding_model: str) -> dict[str, dict[str, Any]]:
    """Group records by unique source document metadata."""
    unique_docs: dict[str, dict[str, Any]] = {}

    for record in records:
        source_doc = (record.get("source_document") or "Untitled Document").strip()
        source_name = (record.get("source_name") or "").strip()
        source_url = (record.get("source_url") or "").strip()
        data_type = (record.get("data_type") or "periodic").strip()
        retrieved_at = record.get("retrieved_at")

        # Create unique composite key for document
        doc_key = f"{source_doc}||{source_url}"
        if doc_key not in unique_docs:
            unique_docs[doc_key] = {
                "document_title": source_doc,
                "source_name": source_name,
                "source_url": source_url,
                "data_type": data_type,
                "metadata": {
                    "retrieved_at": retrieved_at,
                    "embedding_model": embedding_model,
                    "source_name": source_name,
                },
            }

    return unique_docs


def ingest_documents(
    client: Client,
    unique_docs: dict[str, dict[str, Any]],
) -> dict[str, str]:
    """Idempotently insert or retrieve documents from `rag.documents`.

    Returns a mapping from `doc_key` to the database `document_id` (UUID).
    """
    doc_id_map: dict[str, str] = {}
    logger.info("Syncing %d unique source documents to rag.documents...", len(unique_docs))

    for doc_key, doc_payload in unique_docs.items():
        doc_title = doc_payload["document_title"]
        source_url = doc_payload["source_url"]

        # 1. Check if document already exists
        query = (
            client.schema("rag")
            .table("documents")
            .select("id, document_title, source_url")
            .eq("document_title", doc_title)
        )
        if source_url:
            query = query.eq("source_url", source_url)

        existing = query.execute()

        if existing.data and len(existing.data) > 0:
            doc_id = existing.data[0]["id"]
            logger.info("  Found existing document '%s' (ID: %s)", doc_title, doc_id)
            doc_id_map[doc_key] = str(doc_id)
        else:
            # 2. Insert new document
            logger.info("  Inserting new document '%s'...", doc_title)
            insert_res = (
                client.schema("rag")
                .table("documents")
                .insert(doc_payload)
                .execute()
            )
            if not insert_res.data:
                raise RuntimeError(f"Failed to insert document '{doc_title}': no data returned.")
            doc_id = insert_res.data[0]["id"]
            logger.info("  Created document '%s' (ID: %s)", doc_title, doc_id)
            doc_id_map[doc_key] = str(doc_id)

    return doc_id_map


def ingest_chunks(
    client: Client,
    records: list[dict[str, Any]],
    doc_id_map: dict[str, str],
    embedding_model: str,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> int:
    """Idempotently upsert chunk records in batches into `rag.chunks`."""
    total_records = len(records)
    logger.info(
        "Ingesting %d chunks into rag.chunks in batches of %d...",
        total_records,
        batch_size,
    )

    upserted_count = 0
    for i in range(0, total_records, batch_size):
        batch_records = records[i : i + batch_size]
        batch_payload: list[dict[str, Any]] = []

        for r in batch_records:
            source_doc = (r.get("source_document") or "Untitled Document").strip()
            source_url = (r.get("source_url") or "").strip()
            doc_key = f"{source_doc}||{source_url}"
            doc_id = doc_id_map.get(doc_key)

            if not doc_id:
                raise KeyError(f"No document ID mapped for chunk '{r.get('chunk_id')}' (key: {doc_key})")

            chunk_payload = {
                "document_id": doc_id,
                "chunk_id": r["chunk_id"],
                "chunk_text": r["text"],
                "embedding": r["embedding"],
                "metadata": {
                    "source_document": r.get("source_document"),
                    "source_name": r.get("source_name"),
                    "source_url": r.get("source_url"),
                    "data_type": r.get("data_type"),
                    "retrieved_at": r.get("retrieved_at"),
                    "embedding_model": embedding_model,
                },
            }
            batch_payload.append(chunk_payload)

        # Upsert batch with on_conflict on chunk_id for idempotency
        try:
            res = (
                client.schema("rag")
                .table("chunks")
                .upsert(batch_payload, on_conflict="chunk_id")
                .execute()
            )
            count = len(res.data) if res.data else len(batch_payload)
            upserted_count += count
            logger.info(
                "  Upserted batch %d–%d / %d chunks",
                i + 1,
                min(i + batch_size, total_records),
                total_records,
            )
        except Exception as exc:
            logger.error("Failed to upsert chunk batch %d–%d: %s", i + 1, i + len(batch_payload), exc)
            raise RuntimeError(f"Chunk batch ingestion failed: {exc}") from exc

    return upserted_count


def verify_supabase_counts(client: Client) -> tuple[int, int]:
    """Query and return counts of `rag.documents` and `rag.chunks`."""
    doc_res = client.schema("rag").table("documents").select("id", count="exact").execute()
    doc_count = doc_res.count if doc_res.count is not None else len(doc_res.data or [])

    chunk_res = client.schema("rag").table("chunks").select("id", count="exact").execute()
    chunk_count = chunk_res.count if chunk_res.count is not None else len(chunk_res.data or [])

    return doc_count, chunk_count


def verify_similarity_search(
    client: Client,
    sample_embedding: list[float],
    match_count: int = 3,
) -> list[dict[str, Any]]:
    """Test the `rag.match_chunks()` RPC similarity function."""
    logger.info("Testing rag.match_chunks() RPC with sample 1024-dim embedding...")
    try:
        res = (
            client.schema("rag")
            .rpc(
                "match_chunks",
                {
                    "query_embedding": sample_embedding,
                    "match_threshold": 0.0,
                    "match_count": match_count,
                },
            )
            .execute()
        )
        return res.data or []
    except Exception as exc:
        logger.error("Similarity search test RPC failed: %s", exc)
        raise


def run_ingestion(
    file_path: Path = DEFAULT_FILE_PATH,
    batch_size: int = DEFAULT_BATCH_SIZE,
    run_test_query: bool = True,
) -> None:
    """Execute the full RAG Supabase ingestion and verification pipeline."""
    # Step 1: Read & Validate Dataset
    dataset = read_and_validate_dataset(file_path)
    embedding_model = dataset["embedding_model"]
    embedding_dim = dataset["embedding_dimension"]
    records = dataset["records"]
    unique_docs = group_documents(records, embedding_model)

    # Step 2: Print Dataset Summary (Requirement 9)
    print("\n" + "=" * 50)
    print("RAG Embeddings Dataset Summary")
    print("=" * 50)
    print(f"Embedding Model:     {embedding_model}")
    print(f"Embedding Dimension: {embedding_dim}")
    print(f"Total Records:       {len(records)}")
    print(f"Unique Documents:    {len(unique_docs)}")
    print(f"Unique Chunks:       {len(records)}")
    print("=" * 50 + "\n")

    # Step 3: Connect to Supabase
    url, key = load_environment()
    client = get_supabase_client(url, key)
    logger.info("Connected to Supabase at: %s", url)

    # Step 4: Ingest Documents (rag.documents)
    doc_id_map = ingest_documents(client, unique_docs)

    # Step 5: Ingest Chunks (rag.chunks)
    ingest_chunks(
        client=client,
        records=records,
        doc_id_map=doc_id_map,
        embedding_model=embedding_model,
        batch_size=batch_size,
    )

    # Step 6: Verify and Print Database Counts (Requirement 10)
    doc_count, chunk_count = verify_supabase_counts(client)
    print("\n" + "=" * 50)
    print("Supabase Database Verification")
    print("=" * 50)
    print(f"rag.documents count: {doc_count}")
    print(f"rag.chunks count:    {chunk_count}")
    print("=" * 50 + "\n")

    # Step 7: Test rag.match_chunks() RPC (Requirement 20)
    if run_test_query and records:
        sample_chunk = records[0]
        logger.info(
            "Running verification search using embedding from chunk: '%s'",
            sample_chunk.get("chunk_id"),
        )
        matches = verify_similarity_search(
            client=client,
            sample_embedding=sample_chunk["embedding"],
            match_count=3,
        )
        print("=" * 50)
        print("RAG Retrieval Test Results (rag.match_chunks)")
        print("=" * 50)
        for idx, match in enumerate(matches, start=1):
            sim = match.get("similarity", 0.0)
            chunk_id = match.get("chunk_id")
            doc_title = match.get("document_title") or match.get("source_name")
            snippet = match.get("chunk_text", "")[:120].replace("\n", " ")
            print(f"[{idx}] Similarity: {sim:.4f} | Chunk: {chunk_id} | Doc: {doc_title}")
            print(f"    Text: {snippet}...")
        print("=" * 50 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Ingest pre-computed BGE-M3 embeddings into Supabase (rag schema)."
    )
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_FILE_PATH,
        help=f"Path to embeddings JSON file (default: {DEFAULT_FILE_PATH})",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help=f"Batch size for chunk upserts (default: {DEFAULT_BATCH_SIZE})",
    )
    parser.add_argument(
        "--no-test-query",
        action="store_true",
        help="Skip the post-ingestion similarity search test query.",
    )

    args = parser.parse_args()

    # Resolve file path relative to repo root if not absolute
    file_path = args.file
    if not file_path.is_absolute():
        repo_root = Path(__file__).resolve().parent.parent.parent.parent
        resolved = repo_root / file_path
        if resolved.exists():
            file_path = resolved

    try:
        run_ingestion(
            file_path=file_path,
            batch_size=args.batch_size,
            run_test_query=not args.no_test_query,
        )
    except Exception as exc:
        logger.error("Ingestion failed: %s", exc)
        sys.exit(1)


if __name__ == "__main__":
    main()
