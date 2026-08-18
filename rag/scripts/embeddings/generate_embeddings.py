"""Generate BAAI/bge-m3 embeddings for all RAG chunks."""

from __future__ import annotations

import json
from pathlib import Path

from sentence_transformers import SentenceTransformer


MODEL_NAME = "BAAI/bge-m3"

CHUNK_FILES = [
    Path("rag/processed/chunks/dea_national_summary_2026-08-14_chunks.json"),
    Path("rag/processed/chunks/rbi_rates_chunks.json"),
    Path("rag/processed/chunks/rbi_vrrr_chunks.json"),
    Path("rag/processed/chunks/sebi_bulletin_july_2026_chunks.json"),
    Path("rag/processed/chunks/nse_primary_market_june_2026_chunks.json"),
]

OUTPUT_FILE = Path(
    "rag/processed/embeddings/rag_embeddings.json"
)


def main() -> None:
    print(f"Loading model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)

    records = []

    for chunk_file in CHUNK_FILES:
        print(f"Loading: {chunk_file}")

        data = json.loads(chunk_file.read_text(encoding="utf-8"))
        chunks = data.get("chunks", [])

        print(f"  Chunks found: {len(chunks)}")

        for chunk in chunks:
            text = chunk.get("text", "").strip()

            if not text:
                continue

            records.append(
                {
                    "source_document": data.get("source_document"),
                    "source_name": data.get("source_name"),
                    "source_url": data.get("source_url"),
                    "retrieved_at": data.get("retrieved_at"),
                    "data_type": data.get("data_type"),
                    "chunk_id": chunk.get("chunk_id"),
                    "text": text,
                }
            )

    if not records:
        raise RuntimeError("No valid chunks found.")

    print(f"Total chunks: {len(records)}")
    print("Generating embeddings...")

    texts = [record["text"] for record in records]

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=True,
    )

    for record, embedding in zip(records, embeddings):
        record["embedding"] = embedding.tolist()

    output = {
        "embedding_model": MODEL_NAME,
        "embedding_dimension": len(embeddings[0]),
        "data_type": "periodic",
        "count": len(records),
        "records": records,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT_FILE.write_text(
        json.dumps(output, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"Saved embeddings to: {OUTPUT_FILE}")
    print(f"Embeddings: {len(records)}")
    print(f"Dimension: {len(embeddings[0])}")


if __name__ == "__main__":
    main()