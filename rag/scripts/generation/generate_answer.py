"""Generate grounded DhanMitra answers using RAG + live data + Groq."""

from __future__ import annotations

import os
import sys
from pathlib import Path


# ================================================================
# PROJECT PATH
# ================================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ================================================================
# IMPORTS
# ================================================================

from dotenv import load_dotenv
from groq import Groq

from rag.scripts.context.build_context import build_context
from rag.scripts.retrieval.retrieve_chunks import retrieve_chunks
from rag.scripts.live_data.live_router import get_live_data


# ================================================================
# CONFIGURATION
# ================================================================

SYSTEM_PROMPT_FILE = (
    PROJECT_ROOT
    / "rag"
    / "scripts"
    / "prompts"
    / "system_prompt.txt"
)

load_dotenv(PROJECT_ROOT / ".env")

MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


# ================================================================
# SYSTEM PROMPT
# ================================================================

def load_system_prompt() -> str:
    """Load the DhanMitra system prompt from disk."""

    if not SYSTEM_PROMPT_FILE.exists():
        raise FileNotFoundError(
            f"System prompt not found: {SYSTEM_PROMPT_FILE}"
        )

    return SYSTEM_PROMPT_FILE.read_text(
        encoding="utf-8"
    ).strip()


# ================================================================
# GROQ CLIENT
# ================================================================

def get_groq_client() -> Groq:
    """Create a Groq client using the environment API key."""

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY must be set."
        )

    return Groq(api_key=api_key)


# ================================================================
# LIVE DATA FORMATTING
# ================================================================

def format_live_data(live_data: dict) -> str:
    """
    Convert live provider data into structured context
    for the LLM.
    """

    if not live_data:
        return "No live data is available."

    lines = []

    lines.append("LIVE DATA")
    lines.append("--------")

    provider = live_data.get("provider")

    if provider:
        lines.append(f"Provider: {provider}")

    for key, value in live_data.items():

        if key == "provider":
            continue

        # Make dictionary values readable.
        if isinstance(value, dict):
            lines.append(f"{key}:")
            for sub_key, sub_value in value.items():
                lines.append(
                    f"  {sub_key}: {sub_value}"
                )
        else:
            lines.append(
                f"{key}: {value}"
            )

    return "\n".join(lines)


# ================================================================
# GENERATE ANSWER
# ================================================================

def generate_answer(
    question: str,
    results: list[dict] | None = None,
) -> str:
    """
    Generate a grounded DhanMitra answer.

    Pipeline:

        User Question
              |
              +----> RAG Retrieval
              |
              +----> Live Data Router
              |
              v
        Combined Context
              |
              v
            Groq
              |
              v
        Final Answer
    """

    if not question or not question.strip():
        raise ValueError(
            "Question cannot be empty."
        )

    question = question.strip()

    # ============================================================
    # 1. RAG RETRIEVAL
    # ============================================================

    if results is None:
        results = retrieve_chunks(question)

    rag_context = build_context(results)

    # ============================================================
    # 2. LIVE DATA
    # ============================================================

    live_data = get_live_data(question)

    if live_data:
        live_context = format_live_data(
            live_data
        )
    else:
        live_context = (
            "No live-data provider matched this question."
        )

    # ============================================================
    # 3. SYSTEM PROMPT
    # ============================================================

    system_prompt = load_system_prompt()

    # ============================================================
    # 4. COMBINED USER PROMPT
    # ============================================================

    user_prompt = f"""
You are answering a user question for DhanMitra.

Use ONLY the information provided in the RAG CONTEXT
and LIVE DATA sections below.

IMPORTANT GROUNDING RULES:

1. Use LIVE DATA when it is available and relevant
   to the user's question.

2. Use RAG CONTEXT for schemes, policies, financial
   education, historical information, and other
   knowledge-based questions.

3. Do NOT use your general or pretrained knowledge
   to fill gaps in the supplied context.

4. Every factual claim in your answer must be supported
   by either the RAG CONTEXT or LIVE DATA.

5. Do NOT invent facts, numbers, dates, eligibility
   conditions, exclusions, limits, statistics,
   regulations, prices, rates, or policies.

6. If a detail requested by the user is not present
   in the supplied context, clearly say that the
   available DhanMitra data does not provide that
   detail.

7. Do not infer additional eligibility conditions,
   exclusions, thresholds, limits, or requirements
   from general knowledge.

8. Do not treat related RAG chunks as proof of an answer.
   Use only information that directly supports the question.

9. Ignore irrelevant RAG chunks.

10. When LIVE DATA and RAG DATA contain different values
    for the same current metric, use the LIVE DATA value.

11. Do not describe periodic or historical RAG data
    as live or real-time.

12. Do not invent or reinterpret timestamps.

13. If a timestamp is already provided in readable form,
    use it as provided.

14. If the available evidence is insufficient, say so
    instead of guessing.

15. Keep the answer clear, concise, and suitable for
    a beginner in India.

16. For current financial values, mention the currency,
    unit, and timestamp when those are available.

17. Mention the relevant source/provider when appropriate.

============================================================
RAG CONTEXT
============================================================

{rag_context}

============================================================
LIVE DATA
============================================================

{live_context}

============================================================
USER QUESTION
============================================================

{question}

============================================================
FINAL INSTRUCTION
============================================================

Answer the user's question using only the supported
information above.

Do not add unsupported information simply to make the
answer more complete.

If the context does not contain enough information,
say that clearly.
"""

    # ============================================================
    # 5. CALL GROQ
    # ============================================================

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
        temperature=0.1,
        max_tokens=1000,
    )

    answer = response.choices[0].message.content

    if not answer:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return answer.strip()


# ================================================================
# TEST
# ================================================================

def main() -> None:
    """Run DhanMitra generation tests."""

    questions = [
        "What is PM-KISAN?",
        "What is the current Bitcoin price?",
        "What is the current repo rate?",
        "What is USD to INR?",
        "What is the current Reliance price?",
        "What is the current gold price?",
        "What is PM-KISAN and what is the current Bitcoin price?",
    ]

    for question in questions:

        print("\n" + "=" * 70)
        print(f"QUESTION: {question}")

        try:

            answer = generate_answer(question)

            print("\n===== DHANMITRA ANSWER =====")
            print(answer)

        except Exception as exc:

            print("\n===== GENERATION FAILED =====")

            print(
                f"{type(exc).__name__}: {exc}"
            )


# ================================================================
# ENTRY POINT
# ================================================================

if __name__ == "__main__":
    main()