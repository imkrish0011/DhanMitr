import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from rag.scripts.retrieval.retrieve_chunks import retrieve_chunks


QUESTIONS = [
    "What is PM-KISAN and who is eligible for it?",
    "What is the repo rate in India?",
    "What is India's fiscal deficit?",
    "What is PM SVANidhi and who can benefit from it?",
]


def main() -> None:
    for question in QUESTIONS:
        print("\n" + "=" * 80)
        print(f"QUESTION: {question}")
        print("=" * 80)

        results = retrieve_chunks(
            question,
            match_threshold=0.0,
            match_count=5,
        )

        print(f"Results: {len(results)}")

        for index, result in enumerate(results, start=1):
            print("\n" + "-" * 80)
            print(f"RESULT {index}")
            print(f"Document: {result.get('document_title')}")
            print(f"Source: {result.get('source_name')}")
            print(f"Similarity: {result.get('similarity')}")
            print("TEXT:")
            print(result.get("chunk_text", ""))


if __name__ == "__main__":
    main()