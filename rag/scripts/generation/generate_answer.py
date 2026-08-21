"""Generate grounded DhanMitra answers using RAG context and Groq."""

from __future__ import annotations

import os
import sys
from pathlib import Path


# Add project root to Python import path.
PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from dotenv import load_dotenv
from groq import Groq

from rag.scripts.context.build_context import build_context
from rag.scripts.retrieval.retrieve_chunks import retrieve_chunks


SYSTEM_PROMPT_FILE = (
    PROJECT_ROOT / "rag" / "scripts" / "prompts" / "system_prompt.txt"
)

MODEL_NAME = "openai/gpt-oss-120b"

load_dotenv(PROJECT_ROOT / ".env")


def load_system_prompt() -> str:
    """Load the DhanMitra system prompt from disk."""

    if not SYSTEM_PROMPT_FILE.exists():
        raise FileNotFoundError(
            f"System prompt not found: {SYSTEM_PROMPT_FILE}"
        )

    return SYSTEM_PROMPT_FILE.read_text(encoding="utf-8").strip()


def get_groq_client() -> Groq:
    """Create a Groq client using the environment API key."""

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY must be set.")

    return Groq(api_key=api_key)


def generate_answer(question: str) -> str:
    """Retrieve context and generate a grounded answer with Groq."""

    results = retrieve_chunks(question)

    context = build_context(results)

    system_prompt = load_system_prompt()

    user_prompt = f"""
RETRIEVED CONTEXT:

{context}

USER QUESTION:

{question}

Answer the user's question using the provided context.
"""

    client = get_groq_client()

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.2,
        max_tokens=1000,
    )

    return response.choices[0].message.content.strip()


def main() -> None:
    question = "What is India's fiscal deficit?"

    print(f"Question: {question}")
    print("\nGenerating DhanMitra answer...\n")

    answer = generate_answer(question)

    print("===== DHANMITRA ANSWER =====")
    print(answer)


if __name__ == "__main__":
    main()