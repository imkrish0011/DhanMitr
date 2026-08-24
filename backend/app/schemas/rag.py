"""RAG Pydantic schemas for DhanMITR."""

from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

from backend.app.services import rag_service


class RAGSearchRequest(BaseModel):
    """Request body for the RAG similarity-search endpoint."""

    query_embedding: list[float] = Field(
        ...,
        description="A 1024-dimensional BGE-M3 embedding vector.",
    )
    match_count: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of results to return (1–20).",
    )
    match_threshold: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Minimum cosine-similarity score (0.0–1.0).",
    )

    @field_validator("query_embedding")
    @classmethod
    def validate_embedding_length(cls, v: list[float]) -> list[float]:
        if len(v) != rag_service.EMBEDDING_DIM:
            raise ValueError(
                f"query_embedding must have exactly {rag_service.EMBEDDING_DIM} "
                f"dimensions, got {len(v)}"
            )
        return v


class RAGChunkResult(BaseModel):
    """A single chunk returned from the RAG similarity search."""

    id: Any = None
    document_id: Any = None
    chunk_id: Any = None
    chunk_text: str = ""
    source_name: str = ""
    source_url: str = ""
    document_title: str = ""
    data_type: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    similarity: float = 0.0


class RAGSearchResponse(BaseModel):
    """Response wrapper for the RAG similarity-search endpoint."""

    results: list[RAGChunkResult]


class KnowledgeSourceSchema(BaseModel):
    """Schema representing a citation source for generated RAG answers."""

    title: str = ""
    source_type: str = "rag"
    snippet: str = ""
    url: Optional[str] = None
    similarity: float = 0.0


class RAGAskRequest(BaseModel):
    """Request schema for end-to-end question answering via RAG + Live Data + LLM."""

    question: str = Field(..., min_length=1, description="Natural language user question")
    financial_context: Optional[dict[str, Any]] = Field(
        default=None, description="Optional user finance context (income, expenses, etc.)"
    )
    language: Optional[str] = Field(
        default="en", description="Target response language ('en', 'hi', 'hinglish')"
    )
    history: Optional[list[dict[str, str]]] = Field(
        default=None, description="Recent conversation turns [{'role': 'user'|'assistant', 'content': '...'}]"
    )


class RAGAskResponse(BaseModel):
    """Response schema for end-to-end question answering."""

    question: str
    answer: str
    reply_text: str
    language: str = "en"
    sources: list[KnowledgeSourceSchema] = Field(default_factory=list)
    live_data: Optional[dict[str, Any]] = None
    suggested_actions: list[str] = Field(default_factory=list)
