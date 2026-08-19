# Supabase RAG Ingestion

This script ingests pre-computed 1024-dimensional BGE-M3 embeddings from `rag/processed/embeddings/rag_embeddings.json` into Supabase `rag.documents` and `rag.chunks`.

## Prerequisites

1. Install dependencies:
   ```bash
   pip install -r rag/requirements.txt
   ```
   Or from backend:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. Configure environment variables in `.env` or your shell:
   ```env
   SUPABASE_URL=https://<your-project-id>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

> **Note on Supabase Schema:**
> If `rag` is a custom schema, ensure `rag` is added to **Exposed schemas** in the Supabase Dashboard (`Project Settings -> API -> Data API -> Exposed schemas = public, rag`).

## Usage

From the repository root (`DhanMitr`):

```bash
python rag/scripts/ingest/ingest_to_supabase.py
```

### Optional Arguments

- `--file PATH`: Path to a custom embeddings JSON file (default: `rag/processed/embeddings/rag_embeddings.json`)
- `--batch-size N`: Batch size for chunk upserts (default: `10`)
- `--no-test-query`: Skip the post-ingestion similarity search verification query

Example:
```bash
python rag/scripts/ingest/ingest_to_supabase.py --batch-size 15
```

## Features

- **Dataset Validation:** Checks embedding dimension (1024), record count, non-empty text, chunk IDs, and unique chunk constraints.
- **Idempotency:** Automatically detects existing documents and upserts chunks on `chunk_id` without creating duplicates.
- **Batching:** Ingests chunks in configurable batch sizes to avoid request timeouts.
- **Verification:** Queries and prints final `rag.documents` and `rag.chunks` counts, followed by a sample similarity search via `rag.match_chunks()`.
