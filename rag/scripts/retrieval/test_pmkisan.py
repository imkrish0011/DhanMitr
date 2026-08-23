import sys
from pathlib import Path


# Add project root to Python import path.
PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from rag.scripts.retrieval.retrieve_chunks import retrieve_chunks


question = "What is PM-KISAN and who is eligible for it?"

results = retrieve_chunks(
    question,
    match_threshold=0.30,
    match_count=5,
)

print("Results:", len(results))

for index, result in enumerate(results, start=1):
    print(
        f"{index}. "
        f"{result.get('source_name')} | "
        f"{result.get('document_title')} | "
        f"similarity={result.get('similarity')}"
    )