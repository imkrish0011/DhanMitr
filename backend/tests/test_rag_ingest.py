"""Unit tests for the Supabase RAG ingestion script.

Tests dataset validation, document grouping, idempotent document and chunk ingestion,
and Supabase RPC test queries with mocks.
"""

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from rag.scripts.ingest.ingest_to_supabase import (
    EXPECTED_EMBEDDING_DIM,
    group_documents,
    ingest_chunks,
    ingest_documents,
    read_and_validate_dataset,
    verify_similarity_search,
    verify_supabase_counts,
)


def _create_sample_dataset(
    count: int = 2,
    dim: int = EXPECTED_EMBEDDING_DIM,
    duplicate_chunk: bool = False,
    empty_text: bool = False,
    missing_chunk_id: bool = False,
) -> dict:
    records = []
    for i in range(count):
        chunk_id = f"doc-chunk-{1 if duplicate_chunk else i}"
        if missing_chunk_id and i == 0:
            chunk_id = ""

        records.append(
            {
                "source_document": f"Source Doc {i % 2}",
                "source_name": "Test Authority",
                "source_url": f"https://example.com/doc/{i % 2}",
                "retrieved_at": "2026-08-19T00:00:00Z",
                "data_type": "periodic",
                "chunk_id": chunk_id,
                "text": "" if (empty_text and i == 0) else f"Sample chunk text content {i}",
                "embedding": [0.05] * dim,
            }
        )

    return {
        "embedding_model": "BAAI/bge-m3",
        "embedding_dimension": dim,
        "data_type": "periodic",
        "count": count,
        "records": records,
    }


class TestDatasetValidation:
    def test_valid_actual_file(self):
        file_path = ROOT_DIR / "rag" / "processed" / "embeddings" / "rag_embeddings.json"
        data = read_and_validate_dataset(file_path)
        assert data["count"] == len(data["records"])
        assert data["count"] >= 36
        assert data["embedding_dimension"] == 1024

    def test_file_not_found(self, tmp_path):
        non_existent = tmp_path / "does_not_exist.json"
        with pytest.raises(FileNotFoundError):
            read_and_validate_dataset(non_existent)

    def test_invalid_dimension(self, tmp_path):
        bad_data = _create_sample_dataset(dim=512)
        f = tmp_path / "bad_dim.json"
        f.write_text(json.dumps(bad_data), encoding="utf-8")
        with pytest.raises(ValueError, match="Invalid embedding_dimension"):
            read_and_validate_dataset(f)

    def test_count_mismatch(self, tmp_path):
        bad_data = _create_sample_dataset(count=2)
        bad_data["count"] = 5
        f = tmp_path / "count_mismatch.json"
        f.write_text(json.dumps(bad_data), encoding="utf-8")
        with pytest.raises(ValueError, match="Record count mismatch"):
            read_and_validate_dataset(f)

    def test_duplicate_chunk_id(self, tmp_path):
        bad_data = _create_sample_dataset(count=2, duplicate_chunk=True)
        f = tmp_path / "dup.json"
        f.write_text(json.dumps(bad_data), encoding="utf-8")
        with pytest.raises(ValueError, match="Duplicate 'chunk_id' detected"):
            read_and_validate_dataset(f)

    def test_missing_chunk_id(self, tmp_path):
        bad_data = _create_sample_dataset(count=2, missing_chunk_id=True)
        f = tmp_path / "missing_chunk.json"
        f.write_text(json.dumps(bad_data), encoding="utf-8")
        with pytest.raises(ValueError, match="missing a valid non-empty 'chunk_id'"):
            read_and_validate_dataset(f)

    def test_empty_text(self, tmp_path):
        bad_data = _create_sample_dataset(count=2, empty_text=True)
        f = tmp_path / "empty_text.json"
        f.write_text(json.dumps(bad_data), encoding="utf-8")
        with pytest.raises(ValueError, match="missing or empty 'text'"):
            read_and_validate_dataset(f)

    def test_invalid_embedding_vector_len(self, tmp_path):
        bad_data = _create_sample_dataset(count=2)
        bad_data["records"][0]["embedding"] = [0.1] * 1023
        f = tmp_path / "bad_vec.json"
        f.write_text(json.dumps(bad_data), encoding="utf-8")
        with pytest.raises(ValueError, match="must have exactly 1024 values"):
            read_and_validate_dataset(f)


class TestDocumentGrouping:
    def test_group_documents(self):
        records = [
            {"source_document": "Doc A", "source_url": "https://a.com", "source_name": "A", "data_type": "periodic"},
            {"source_document": "Doc A", "source_url": "https://a.com", "source_name": "A", "data_type": "periodic"},
            {"source_document": "Doc B", "source_url": "https://b.com", "source_name": "B", "data_type": "periodic"},
        ]
        groups = group_documents(records, "BAAI/bge-m3")
        assert len(groups) == 2
        assert "Doc A||https://a.com" in groups
        assert "Doc B||https://b.com" in groups
        assert groups["Doc A||https://a.com"]["document_title"] == "Doc A"


class TestIngestionExecution:
    def test_ingest_documents_idempotency(self):
        unique_docs = {
            "Doc A||https://a.com": {
                "document_title": "Doc A",
                "source_name": "A",
                "source_url": "https://a.com",
                "data_type": "periodic",
                "metadata": {},
            }
        }
        mock_client = MagicMock()
        mock_table = MagicMock()
        mock_client.schema.return_value.table.return_value = mock_table

        # Simulate existing doc found
        mock_select = MagicMock()
        mock_select.eq.return_value = mock_select
        mock_select.execute.return_value.data = [{"id": "existing-uuid-1"}]
        mock_table.select.return_value = mock_select

        doc_map = ingest_documents(mock_client, unique_docs)
        assert doc_map["Doc A||https://a.com"] == "existing-uuid-1"
        mock_table.insert.assert_not_called()

    def test_ingest_documents_insert_new(self):
        unique_docs = {
            "Doc New||https://new.com": {
                "document_title": "Doc New",
                "source_name": "New Auth",
                "source_url": "https://new.com",
                "data_type": "periodic",
                "metadata": {},
            }
        }
        mock_client = MagicMock()
        mock_table = MagicMock()
        mock_client.schema.return_value.table.return_value = mock_table

        # Simulate no existing doc found, then insert returns new id
        mock_select = MagicMock()
        mock_select.eq.return_value = mock_select
        mock_select.execute.return_value.data = []
        mock_table.select.return_value = mock_select

        mock_insert = MagicMock()
        mock_insert.execute.return_value.data = [{"id": "new-uuid-2"}]
        mock_table.insert.return_value = mock_insert

        doc_map = ingest_documents(mock_client, unique_docs)
        assert doc_map["Doc New||https://new.com"] == "new-uuid-2"
        mock_table.insert.assert_called_once()

    def test_ingest_chunks_batches(self):
        data = _create_sample_dataset(count=5)
        records = data["records"]
        doc_id_map = {
            "Source Doc 0||https://example.com/doc/0": "uuid-0",
            "Source Doc 1||https://example.com/doc/1": "uuid-1",
        }

        mock_client = MagicMock()
        mock_table = MagicMock()
        mock_client.schema.return_value.table.return_value = mock_table
        mock_table.upsert.return_value.execute.return_value.data = [{"id": 1}, {"id": 2}]

        upserted = ingest_chunks(
            client=mock_client,
            records=records,
            doc_id_map=doc_id_map,
            embedding_model="BAAI/bge-m3",
            batch_size=2,
        )

        assert mock_table.upsert.call_count == 3  # ceil(5 / 2) = 3 batches
        assert upserted > 0

    def test_verify_supabase_counts(self):
        mock_client = MagicMock()
        mock_table = MagicMock()
        mock_client.schema.return_value.table.return_value = mock_table

        mock_res = MagicMock()
        mock_res.count = 36
        mock_table.select.return_value.execute.return_value = mock_res

        docs, chunks = verify_supabase_counts(mock_client)
        assert docs == 36
        assert chunks == 36

    def test_verify_similarity_search(self):
        mock_client = MagicMock()
        mock_schema = MagicMock()
        mock_rpc = MagicMock()
        mock_rpc.execute.return_value.data = [{"chunk_id": "c1", "similarity": 0.95}]
        mock_schema.rpc.return_value = mock_rpc
        mock_client.schema.return_value = mock_schema

        results = verify_similarity_search(mock_client, [0.1] * 1024, match_count=3)
        assert len(results) == 1
        assert results[0]["similarity"] == 0.95
