"""Build clean, structured context from retrieved RAG chunks."""

from __future__ import annotations


def build_context(results: list[dict]) -> str:
    """
    Convert retrieved chunks into structured context for the LLM.

    Args:
        results: Results returned by rag.match_chunks().

    Returns:
        A formatted context string ready to be passed to the LLM.
    """

    if not results:
        return "No relevant information was retrieved from the knowledge base."

    sections = []

    for index, result in enumerate(results, start=1):
        source_name = result.get("source_name") or "Unknown source"
        document_title = result.get("document_title") or "Unknown document"
        chunk_id = result.get("chunk_id") or "Unknown chunk"
        data_type = result.get("data_type") or "Unknown"
        similarity = result.get("similarity")

        chunk_text = (result.get("chunk_text") or "").strip()

        if not chunk_text:
            continue

        section = (
            f"--- SOURCE {index} ---\n"
            f"Source: {source_name}\n"
            f"Document: {document_title}\n"
            f"Data type: {data_type}\n"
            f"Chunk ID: {chunk_id}\n"
            f"Similarity: {similarity}\n"
            f"Content:\n{chunk_text}"
        )

        sections.append(section)

    if not sections:
        return "No usable information was retrieved from the knowledge base."

    return "\n\n".join(sections)


if __name__ == "__main__":
    sample_results = [
        {
            "source_name": "Reserve Bank of India",
            "document_title": "RBI Current Rates",
            "chunk_id": "RBI-RATES-001",
            "data_type": "periodic",
            "similarity": 0.82,
            "chunk_text": "Sample retrieved financial information.",
        },
        {
            "source_name": "SEBI",
            "document_title": "SEBI Bulletin - July 2026",
            "chunk_id": "SEBI-001",
            "data_type": "periodic",
            "similarity": 0.74,
            "chunk_text": "Sample SEBI information.",
        },
    ]

    print(build_context(sample_results))