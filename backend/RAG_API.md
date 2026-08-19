# DhanMITR Backend — RAG Retrieval API

## Overview

The RAG retrieval endpoint allows server-side semantic search over financial knowledge chunks stored in the Supabase `rag.chunks` table. Retrieval uses **pgvector HNSW** indexing via the database function `rag.match_chunks()`.

> **Note:** This endpoint expects a **pre-computed 1024-dimensional BGE-M3 embedding vector**. Embedding generation is handled by a separate pipeline and is not part of this service.

---

## Endpoint

```
POST /api/v1/rag/search
```

### Request Body

| Field             | Type          | Required | Default | Description                                     |
|-------------------|---------------|----------|---------|-------------------------------------------------|
| `query_embedding` | `float[1024]` | **Yes**  | —       | A 1024-dimensional BGE-M3 embedding vector.     |
| `match_count`     | `int`         | No       | `5`     | Maximum results to return (1–20).               |
| `match_threshold` | `float`       | No       | `0.0`   | Minimum cosine-similarity score (0.0–1.0).      |

**Example:**

```json
{
    "query_embedding": [0.012, -0.034, 0.056, "... 1024 floats total ..."],
    "match_count": 5,
    "match_threshold": 0.0
}
```

### Response

```json
{
    "results": [
        {
            "id": "uuid",
            "document_id": "uuid",
            "chunk_id": "uuid",
            "chunk_text": "Relevant text content...",
            "source_name": "RBI FAQ",
            "source_url": "https://example.com/source",
            "document_title": "Document Title",
            "data_type": "faq",
            "metadata": { "page": 3 },
            "similarity": 0.87
        }
    ]
}
```

If no chunks match (or the database is empty), the response is:

```json
{
    "results": []
}
```

### Error Responses

| Status | Condition                                      |
|--------|------------------------------------------------|
| `422`  | Invalid embedding dimension, match_count, or threshold |
| `503`  | Supabase / RPC call failure                    |

---

## Environment Variables

| Variable                     | Description                          | Used By    |
|------------------------------|--------------------------------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL`   | Supabase project URL                 | Backend    |
| `SUPABASE_SERVICE_ROLE_KEY`  | Supabase service-role key (**secret**)| Backend    |

> ⚠️ The service-role key is **never** sent to the browser. It is only used server-side by the FastAPI backend.

Set these in your `.env` file (which is git-ignored):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## Architecture

```
Frontend  →  FastAPI  →  RAG Router  →  RAG Service  →  Supabase RPC
                                                              ↓
                                                     rag.match_chunks()
                                                              ↓
                                                     pgvector / HNSW
                                                              ↓
                                                       rag.chunks
```

The embedding ingestion pipeline is separate:

```
Documents → Cleaning → Chunking → BGE-M3 → Supabase rag.chunks
```

---

## Local Development

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Start the server

```bash
cd backend
python main.py
```

The server runs at `http://localhost:8000`.

### Verify health

```bash
curl http://localhost:8000/health
```

### Test RAG search

```bash
# Generate a fake 1024-dim vector for testing
python -c "import json; print(json.dumps({'query_embedding': [0.1]*1024, 'match_count': 5, 'match_threshold': 0.0}))" | \
  curl -X POST http://localhost:8000/api/v1/rag/search \
    -H "Content-Type: application/json" \
    -d @-
```

### Run tests

```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```

---

## Interactive API Docs

When the server is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
