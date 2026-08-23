"""Performance and Latency Telemetry for DhanMITR.

Formats clean, monitorable ASCII latency banners in backend console logs
so the team can easily observe latency bottlenecks across STT, RAG Search,
LLM Generation, and TTS Synthesis in real-time.
"""

import logging
import sys
from typing import Any, Dict, List, Optional

# Ensure UTF-8 stdout on Windows where possible
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

logger = logging.getLogger("dhanmitr.telemetry")


def log_pipeline_latency(
    endpoint: str,
    query_text: str,
    language: str,
    language_reason: str,
    total_ms: float,
    stt_provider: Optional[str] = None,
    stt_ms: Optional[float] = None,
    rag_chunks_count: Optional[int] = None,
    rag_ms: Optional[float] = None,
    llm_model: Optional[str] = None,
    llm_ms: Optional[float] = None,
    tts_provider: Optional[str] = None,
    tts_voice: Optional[str] = None,
    tts_ms: Optional[float] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> None:
    """Logs a formatted, high-visibility ASCII latency summary to console."""
    border = "=" * 76
    q_preview = (query_text or "").replace("\n", " ").strip()
    if len(q_preview) > 55:
        q_preview = q_preview[:52] + "..."

    lines = [
        border,
        f"[PERF LOG] {endpoint} | Total: {total_ms:.1f} ms",
        f"   Query: \"{q_preview}\"",
        f"   Language: {language.upper()} ({language_reason})",
        "   --- Pipeline Breakdown ---",
    ]

    if stt_ms is not None and stt_ms > 0:
        lines.append(f"   * STT Audio Transcribe:  {stt_ms:>7.1f} ms  [Engine: {stt_provider or 'unknown'}]")

    if rag_ms is not None:
        matched_str = f"{rag_chunks_count or 0} chunks"
        if sources:
            src_titles = ", ".join(s.get("title", "") for s in sources[:2])
            matched_str += f" ({src_titles})"
        lines.append(f"   * RAG Vector Retrieval:  {rag_ms:>7.1f} ms  [{matched_str}]")

    if llm_ms is not None:
        lines.append(f"   * LLM Groq Generation:   {llm_ms:>7.1f} ms  [Model: {llm_model or 'default'}]")

    if tts_ms is not None and tts_ms > 0:
        lines.append(f"   * TTS Speech Synthesis:  {tts_ms:>7.1f} ms  [Engine: {tts_provider or 'unknown'} | Voice: {tts_voice or 'default'}]")

    lines.append(f"   * Total End-to-End:      {total_ms:>7.1f} ms")
    lines.append(border)

    formatted_log = "\n" + "\n".join(lines)
    logger.info(formatted_log)
    try:
        print(formatted_log)
    except Exception:
        pass
