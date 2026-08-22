"""Voice Processing Service for DhanMITR.

Orchestrates Speech-to-Text (SraVaani), Modular Temporary Response Generation,
and Text-to-Speech (Kokoro). Pre-warms models during application startup.
"""

import asyncio
import logging
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

# Ensure voice package is resolvable
ROOT_DIR = Path(__file__).resolve().parents[3]
VOICE_DIR = ROOT_DIR / "voice"
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(VOICE_DIR) not in sys.path:
    sys.path.insert(0, str(VOICE_DIR))

import voice.audio_utils as audio_utils
import voice.config as voice_config
import voice.stt as stt_module
import voice.tts as tts_module
from shared.types.python.models import (
    FinancialContext,
    STTTelemetry,
    TTSTelemetry,
    VoiceHealthResponse,
    VoiceRequest,
    VoiceResponse,
    VoiceTimingTelemetry,
)

logger = logging.getLogger(__name__)


class VoiceServiceError(Exception):
    """Raised when voice pipeline encounters an error."""


# ---------------------------------------------------------------------------
# Global Service State & Readiness
# ---------------------------------------------------------------------------

_state: Dict[str, Any] = {
    "is_ready": False,
    "is_warming": False,
    "stt_provider": voice_config.STT_PROVIDER,
    "tts_provider": voice_config.TTS_PROVIDER,
    "stt_warmup_ms": 0.0,
    "tts_warmup_ms": 0.0,
    "error": None,
}


def _run_warmup_sync() -> Dict[str, Any]:
    """Execute warmup for STT and TTS synchronously (called in worker thread)."""
    results: Dict[str, Any] = {"stt_ms": 0.0, "tts_ms": 0.0}

    # 1. Warm up STT
    try:
        t0 = time.perf_counter()
        stt_engine = stt_module.get_stt()
        stt_engine.warmup()
        results["stt_ms"] = round((time.perf_counter() - t0) * 1000, 1)
        logger.info(
            "STT provider '%s' warmed up in %s ms",
            stt_engine.name,
            results["stt_ms"],
        )
    except Exception as exc:
        logger.warning("STT warmup encountered an issue: %s", exc)

    # 2. Warm up TTS
    try:
        t0 = time.perf_counter()
        tts_engine = tts_module.get_tts()
        tts_engine.warmup()
        results["tts_ms"] = round((time.perf_counter() - t0) * 1000, 1)
        logger.info(
            "TTS provider '%s' warmed up in %s ms",
            tts_engine.name,
            results["tts_ms"],
        )
    except Exception as exc:
        logger.warning("TTS warmup encountered an issue: %s", exc)

    return results


async def warmup_voice_models() -> None:
    """Pre-load and warm up STT and TTS models during backend startup."""
    global _state
    if _state["is_ready"] or _state["is_warming"]:
        return

    _state["is_warming"] = True
    logger.info(
        "Starting DhanMITR Voice model pre-warming (STT: %s, TTS: %s)...",
        voice_config.STT_PROVIDER,
        voice_config.TTS_PROVIDER,
    )

    try:
        results = await asyncio.to_thread(_run_warmup_sync)
        _state["stt_warmup_ms"] = results["stt_ms"]
        _state["tts_warmup_ms"] = results["tts_ms"]
        _state["is_ready"] = True
        _state["error"] = None
        logger.info("DhanMITR Voice service pre-warming completed successfully.")
    except Exception as exc:
        _state["error"] = str(exc)
        logger.error("Voice pre-warming failed: %s", exc)
    finally:
        _state["is_warming"] = False


def get_voice_health() -> VoiceHealthResponse:
    """Check readiness and status of STT/TTS providers."""
    stt_loaded = stt_module.available_providers()
    tts_loaded = tts_module.available_providers()

    status = "ready" if _state["is_ready"] else ("warming" if _state["is_warming"] else "unwarmed")
    if _state["error"]:
        status = "degraded"

    return VoiceHealthResponse(
        status=status,
        service="dhanmitr-voice",
        stt={
            "configured_provider": voice_config.STT_PROVIDER,
            "providers_loaded": stt_loaded,
            "warmup_latency_ms": _state["stt_warmup_ms"],
        },
        tts={
            "configured_provider": voice_config.TTS_PROVIDER,
            "providers_loaded": tts_loaded,
            "warmup_latency_ms": _state["tts_warmup_ms"],
            "supported_languages": tts_module.supported_languages(),
        },
        uptime_ready=_state["is_ready"],
    )


# ---------------------------------------------------------------------------
# Modular Temporary Response Generation (Financial Domain Heuristics)
# NOTE: RAG/LLM is intentionally bypassed in this phase.
# ---------------------------------------------------------------------------

def generate_temporary_financial_response(
    query: str,
    language_hint: Optional[str] = None,
    context: Optional[FinancialContext] = None,
) -> Tuple[str, str, str]:
    """Generates structured financial answers and spoken summaries.

    Parameters
    ----------
    query : str
        User transcription or text query.
    language_hint : Optional[str]
        'en' | 'hi' | 'hinglish' or None.
    context : Optional[FinancialContext]
        Structured financial snapshot from user session.

    Returns
    -------
    Tuple[str, str, str]
        (full_markdown_text, spoken_voice_reply, effective_language)
    """
    q = (query or "").lower().strip()
    is_hindi = (
        language_hint == "hi"
        or any("\u0900" <= ch <= "\u097f" for ch in query)
        or any(w in q for w in ["खर्च", "बचत", "सब्सक्रिप्शन", "टैक्स", "निवेश", "योजना", "बीमा"])
    )
    effective_lang = "hi" if is_hindi else ("en" if language_hint == "en" else "en")

    # Extract financial context variables defensively
    profile = getattr(context, "profile", None) if context else None
    monthly_income = getattr(profile, "monthly_income", 0.0) or 0.0
    monthly_expenses = getattr(profile, "monthly_expenses", 0.0) or 0.0
    net_surplus = max(0.0, monthly_income - monthly_expenses)
    savings_rate = (
        round((net_surplus / monthly_income) * 100, 1)
        if monthly_income > 0
        else getattr(context, "savings_rate_percentage", 0.0) or 0.0
    )
    risk_tolerance = getattr(profile, "risk_tolerance", "moderate") or "moderate"
    if hasattr(risk_tolerance, "value"):
        risk_tolerance = risk_tolerance.value

    top_categories = getattr(context, "top_spending_categories", []) or []
    subs_total = getattr(context, "active_subscriptions_total", 0.0) or 0.0
    has_no_data = monthly_income == 0 and monthly_expenses == 0 and not top_categories

    if is_hindi:
        if any(w in q for w in ["योजना", "pmjjby", "बीमा", "insurance", "policy"]):
            text = (
                "**प्रधानमंत्री जीवन ज्योति बीमा योजना (PMJJBY):**\n\n"
                "- **पात्रता:** 18 से 50 वर्ष की आयु के बैंक खाताधारक।\n"
                "- **कवरेज:** ₹2,00,000 का जीवन बीमा (किसी भी कारण से मृत्यु पर)।\n"
                "- **प्रीमियम:** ₹436 प्रति वर्ष (सीधे बैंक खाते से ऑटो-डेबिट)।\n"
                "- **सुविधा:** किसी मेडिकल जांच की आवश्यकता नहीं है।"
            )
            voice_reply = "प्रधानमंत्री जीवन ज्योति बीमा योजना में मात्र 436 रुपये सालाना पर 2 लाख रुपये का जीवन बीमा मिलता है।"
            return text, voice_reply, "hi"

        if any(w in q for w in ["टैक्स", "tax", "regime", "80c"]):
            text = (
                "**ओल्ड vs न्यू टैक्स रिजीम तुलना:**\n\n"
                "- **न्यू टैक्स रिजीम (डिफ़ॉल्ट):** ₹7.75 लाख तक की आय पर स्टैंडर्ड डिडक्शन (₹75,000) के साथ शून्य कर।\n"
                "- **ओल्ड टैक्स रिजीम:** यदि आपके पास 80C (₹1.5L), 80D हेल्थ इंश्योरेंस, और HRA जैसी बड़ी कटौतियां हैं तो यह अधिक फायदेमंद हो सकता है।"
            )
            voice_reply = "न्यू टैक्स रिजीम में 7.75 लाख रुपये तक की आय पर शून्य कर है। 80सी और एचआरए छूट के लिए ओल्ड रिजीम चुनें।"
            return text, voice_reply, "hi"

        if has_no_data:
            text = (
                "नमस्ते! आपके पास वर्तमान में कोई वित्तीय रिकॉर्ड नहीं जुड़ा है।\n\n"
                "आप Finance Hub में जाकर अपना वेतन, नियमित खर्च और सक्रिय सब्सक्रिप्शन जोड़ सकते हैं ताकि मैं आपको सटीक सलाह दे सकूँ।"
            )
            voice_reply = "नमस्ते! आपके खाते में अभी वित्तीय रिकॉर्ड नहीं हैं। कृपया अपना बजट और आय जोड़ें।"
            return text, voice_reply, "hi"

        if any(w in q for w in ["विश्लेषण", "खर्च", "expenses", "spend"]):
            text = (
                f"आपकी वर्तमान मासिक आउटफ्लो **₹{monthly_expenses:,.0f}** है।\n\n"
                + (
                    "\n".join([f"- **{c.category if hasattr(c, 'category') else c.get('category', '')}:** ₹{c.amount if hasattr(c, 'amount') else c.get('amount', 0):,.0f}" for c in top_categories[:4]])
                    if top_categories
                    else "- आपके अधिकांश खर्च अभी वर्गीकृत नहीं हैं।"
                )
            )
            voice_reply = f"आपके वर्तमान कुल मासिक खर्च {monthly_expenses:,.0f} रुपये हैं।"
            return text, voice_reply, "hi"

        if any(w in q for w in ["बचत", "save", "surplus"]):
            text = (
                f"आपकी वर्तमान मासिक बचत **₹{net_surplus:,.0f}** ({savings_rate}% बचत दर) है।\n\n"
                "**बचत बढ़ाने के 3 स्मार्ट सुझाव:**\n"
                "1. **आवर्ती खर्चों की समीक्षा:** अप्रयुक्त सब्सक्रिप्शन को पॉज करें।\n"
                "2. **यूटिलिटी और बिल प्रबंधन:** ऑटो-पे और कैशबैक ऑफर्स का उपयोग करें।\n"
                "3. **स्वचालित निवेश:** वेतन आते ही बचत राशि को अलग करें।"
            )
            voice_reply = f"आपकी मासिक बचत दर {savings_rate} प्रतिशत है।"
            return text, voice_reply, "hi"

        if any(w in q for w in ["निवेश", "invest", "mutual fund", "sip"]):
            text = (
                f"आपके **{risk_tolerance.capitalize()}** रिस्क प्रोफाइल के आधार पर:\n\n"
                "- **इंडेक्स म्यूचुअल फंड (Nifty 50):** दीर्घकालिक पूंजी वृद्धि के लिए अनुकूल।\n"
                "- **आपातकालीन निधि (Emergency Fund):** कम से कम 3 से 6 महीने का खर्च सुरक्षित रखें।\n"
                "- **बीमा सुरक्षा:** पर्याप्त टर्म और स्वास्थ्य बीमा सक्रिय रखें।"
            )
            voice_reply = "आपकी रिस्क प्रोफाइल के अनुसार इंडेक्स फंड और आपातकालीन बचत सबसे अनुकूल विकल्प हैं।"
            return text, voice_reply, "hi"

        # General Hindi greeting
        text = (
            f"नमस्ते! आपकी मासिक आय **₹{monthly_income:,.0f}** और मासिक खर्च **₹{monthly_expenses:,.0f}** है। "
            "मैं आपके वित्तीय प्रबंधन में कैसे सहायता कर सकता हूँ?"
        )
        voice_reply = "नमस्ते, मैं आपकी वित्तीय सहायता के लिए तैयार हूँ।"
        return text, voice_reply, "hi"

    else:
        # English flow
        if any(w in q for w in ["pmjjby", "scheme", "jeevan jyoti", "insurance", "policy"]):
            text = (
                "**Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY):**\n\n"
                "- **Coverage:** ₹2,00,000 life insurance on death due to any cause.\n"
                "- **Eligibility:** Bank account holders aged 18 to 50 years.\n"
                "- **Annual Premium:** ₹436/year auto-debited in a single installment.\n"
                "- **Risk Coverage Period:** 1st June to 31st May annually."
            )
            voice_reply = "PMJJBY provides 2 Lakh rupees life cover for an annual premium of 436 rupees."
            return text, voice_reply, "en"

        if any(w in q for w in ["tax", "regime", "80c", "deduction"]):
            text = (
                "**Old vs. New Tax Regime Comparison:**\n\n"
                "- **New Regime (Default):** Zero tax up to **₹7.75 Lakhs** (including ₹75k Standard Deduction for salaried employees).\n"
                "- **Old Regime:** Allows deductions under Section 80C (up to ₹1.5L), 80D (health insurance), HRA, and Home Loan interest."
            )
            voice_reply = "Under the New Regime, income up to 7.75 Lakhs is tax-free with standard deduction. Use the Old regime if you have high 80C and HRA deductions."
            return text, voice_reply, "en"

        if has_no_data:
            text = (
                "Hello! You haven't added any financial records yet.\n\n"
                "Go to the **Finance Hub** to log your income, monthly budget, or active subscriptions. "
                "Once added, I will provide real-time spending insights and custom savings strategies!"
            )
            voice_reply = "Hello! You have not added any financial records yet. Add your income and expenses to get started."
            return text, voice_reply, "en"

        if any(w in q for w in ["expense", "spending", "biggest", "cost", "outflow"]):
            text = (
                f"Here is your current monthly outflow breakdown totaling **₹{monthly_expenses:,.0f}**:\n\n"
                + (
                    "\n".join([f"- **{c.category if hasattr(c, 'category') else c.get('category', '')}:** ₹{c.amount if hasattr(c, 'amount') else c.get('amount', 0):,.0f}" for c in top_categories[:4]])
                    if top_categories
                    else "- No categorized expenses recorded yet."
                )
            )
            voice_reply = f"Your total monthly outflow is {monthly_expenses:,.0f} rupees."
            return text, voice_reply, "en"

        if any(w in q for w in ["save", "saving", "more", "surplus", "budget"]):
            text = (
                f"Your current monthly surplus is **₹{net_surplus:,.0f}** with a **{savings_rate}% savings rate**.\n\n"
                "**Top AI Recommendations to Increase Savings:**\n"
                "1. **Audit Recurring Plans:** Review your active subscriptions.\n"
                "2. **Budget Discipline:** Cap non-essential spending at 30% of net income.\n"
                "3. **Step-up SIP:** Automatically allocate 50% of your surplus into index funds."
            )
            voice_reply = f"Your current monthly surplus is {net_surplus:,.0f} rupees with a {savings_rate} percent savings rate."
            return text, voice_reply, "en"

        if any(w in q for w in ["sub", "netflix", "prime", "renew", "subscription"]):
            text = (
                f"You have active subscriptions totaling **₹{subs_total:,.0f}/mo**.\n\n"
                "Review subscriptions under Finance Hub to prune unused services."
            )
            voice_reply = f"Your active subscriptions total {subs_total:,.0f} rupees per month."
            return text, voice_reply, "en"

        if any(w in q for w in ["invest", "growth", "sip", "portfolio"]):
            text = (
                f"Based on your **{risk_tolerance.capitalize()}** risk tolerance and **₹{net_surplus:,.0f}** surplus:\n\n"
                "- **Broad Index SIPs:** Recommended for disciplined compounding.\n"
                f"- **Emergency Cushion:** Target 3 to 6 months of expenses (₹{monthly_expenses * 6:,.0f}).\n"
                "- **Insurance Safety Net:** Keep active term & health coverage in place."
            )
            voice_reply = "Based on your risk profile and surplus, index SIPs and a solid emergency cushion are your best next steps."
            return text, voice_reply, "en"

        text = (
            f"Hello! Your monthly income is **₹{monthly_income:,.0f}**, total outflow is **₹{monthly_expenses:,.0f}**, "
            f"and net surplus is **₹{net_surplus:,.0f}** ({savings_rate}% savings rate). How can I assist your finances today?"
        )
        voice_reply = "Hello, I am your DhanMITR assistant. How can I help with your finances today?"
        return text, voice_reply, "en"


# ---------------------------------------------------------------------------
# Core Audio Processing Pipeline
# ---------------------------------------------------------------------------

def _process_voice_sync(
    audio_base64: str,
    language_hint: Optional[str] = None,
    voice_id: Optional[str] = None,
    financial_context: Optional[FinancialContext] = None,
) -> Dict[str, Any]:
    """Synchronous pipeline executed in thread pool."""
    pipeline_start = time.perf_counter()
    raw_tmp: Optional[Path] = None
    wav_tmp: Optional[Path] = None
    tts_out: Optional[Path] = None

    try:
        # 1. Decode base64 audio
        raw_tmp = audio_utils.decode_base64_audio(audio_base64)

        # 2. Transcode to 16 kHz mono WAV
        wav_tmp = audio_utils.to_wav16k_mono(raw_tmp)

        # 3. Speech-to-Text Transcription
        stt_result = None
        for engine_key in [None, "faster_whisper", "mock"]:
            try:
                stt_engine = stt_module.get_stt(engine_key)
                stt_result = stt_engine.transcribe(wav_tmp, language=language_hint)
                break
            except Exception as stt_err:
                logger.warning("STT provider '%s' failed, trying next: %s", engine_key or voice_config.STT_PROVIDER, stt_err)

        if not stt_result:
            stt_engine = stt_module.get_stt("mock")
            stt_result = stt_engine.transcribe(wav_tmp, language=language_hint)

        transcript = (stt_result.text or "").strip()

        # If no speech was detected in the audio
        if not transcript:
            answer_text = (
                "No speech was detected. Please try speaking into the microphone again."
                if language_hint != "hi"
                else "कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें।"
            )
            spoken_reply = answer_text
            reply_lang = "hi" if language_hint == "hi" else "en"
        else:
            # 4. Generate Temporary Financial Response (NO RAG/LLM)
            answer_text, spoken_reply, reply_lang = generate_temporary_financial_response(
                query=transcript,
                language_hint=language_hint or stt_result.language,
                context=financial_context,
            )

        # 5. Text-to-Speech Synthesis
        try:
            tts_engine = tts_module.get_tts()
            tts_result = tts_engine.synthesize(
                text=spoken_reply,
                language=reply_lang,
                voice=voice_id,
            )
        except Exception as tts_err:
            logger.warning("Primary TTS provider error, falling back to mock: %s", tts_err)
            tts_engine = tts_module.get_tts("mock")
            tts_result = tts_engine.synthesize(
                text=spoken_reply,
                language=reply_lang,
                voice=voice_id,
            )
        tts_out = tts_result.audio_path

        # 6. Encode synthesized audio to base64
        audio_b64_output = audio_utils.wav_to_base64(tts_out)

        total_ms = round((time.perf_counter() - pipeline_start) * 1000, 1)

        return {
            "transcript": transcript,
            "answer": answer_text,
            "reply_text": answer_text,
            "audio_base64": audio_b64_output,
            "audio_format": "audio/wav",
            "language": reply_lang,
            "duration_seconds": tts_result.audio_seconds,
            "latency_ms": total_ms,
            "stt": {
                "provider": stt_result.provider,
                "latency_ms": stt_result.latency_ms,
            },
            "tts": {
                "provider": tts_result.provider,
                "voice": tts_result.voice,
                "latency_ms": tts_result.latency_ms,
            },
            "timing": {
                "total_ms": total_ms,
            },
        }

    finally:
        # Always clean up temporary files defensively
        audio_utils.cleanup(raw_tmp, wav_tmp, tts_out)


async def process_voice_chat(request: VoiceRequest) -> VoiceResponse:
    """Async handler for POST /api/v1/voice/chat."""
    if not request.audio_base64 and not request.text:
        raise ValueError("Either audio_base64 or text must be provided in VoiceRequest.")

    parsed_context = None
    if request.financial_context:
        if isinstance(request.financial_context, FinancialContext):
            parsed_context = request.financial_context
        elif isinstance(request.financial_context, dict):
            try:
                parsed_context = FinancialContext.model_validate(request.financial_context)
            except Exception:
                parsed_context = None

    if request.audio_base64:
        data = await asyncio.to_thread(
            _process_voice_sync,
            request.audio_base64,
            request.language,
            request.voice_id,
            parsed_context,
        )
        return VoiceResponse(
            transcript=data["transcript"],
            answer=data["answer"],
            reply_text=data["reply_text"],
            audio_base64=data["audio_base64"],
            audio_format=data["audio_format"],
            language=data["language"],
            duration_seconds=data.get("duration_seconds"),
            latency_ms=data.get("latency_ms"),
            stt=STTTelemetry(**data["stt"]),
            tts=TTSTelemetry(**data["tts"]),
            timing=VoiceTimingTelemetry(**data["timing"]),
        )

    # Standalone text chat path
    text_input = (request.text or "").strip()
    t0 = time.perf_counter()
    answer_text, spoken_reply, reply_lang = generate_temporary_financial_response(
        query=text_input,
        language_hint=request.language or "en",
        context=parsed_context,
    )

    try:
        tts_engine = tts_module.get_tts()
        tts_result = await asyncio.to_thread(
            tts_engine.synthesize,
            spoken_reply,
            reply_lang,
            request.voice_id,
        )
    except Exception as tts_err:
        logger.warning("TTS error in text chat, fallback to mock: %s", tts_err)
        tts_engine = tts_module.get_tts("mock")
        tts_result = await asyncio.to_thread(
            tts_engine.synthesize,
            spoken_reply,
            reply_lang,
            request.voice_id,
        )

    b64 = audio_utils.wav_to_base64(tts_result.audio_path)
    audio_utils.cleanup(tts_result.audio_path)
    total_ms = round((time.perf_counter() - t0) * 1000, 1)

    return VoiceResponse(
        transcript=text_input,
        answer=answer_text,
        reply_text=answer_text,
        audio_base64=b64,
        audio_format="audio/wav",
        language=reply_lang,
        duration_seconds=tts_result.audio_seconds,
        latency_ms=total_ms,
        stt=STTTelemetry(provider="none", latency_ms=0.0),
        tts=TTSTelemetry(
            provider=tts_result.provider,
            voice=tts_result.voice,
            latency_ms=tts_result.latency_ms,
        ),
        timing=VoiceTimingTelemetry(total_ms=total_ms),
    )
