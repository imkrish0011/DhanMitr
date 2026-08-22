"""Temporary Financial Response Service for DhanMITR Voice.

NOTE: RAG/LLM is intentionally bypassed in this phase.
This service isolates the temporary heuristic-based financial answer generator
so that it can be cleanly replaced later with:
STT -> RAG -> LLM -> TTS
"""

import logging
from typing import Optional, Tuple
from shared.types.python.models import FinancialContext

logger = logging.getLogger(__name__)


def generate_temporary_financial_response(
    query: str,
    language_hint: Optional[str] = None,
    context: Optional[FinancialContext] = None,
) -> Tuple[str, str, str]:
    """Generates structured financial answers and spoken summaries without RAG/LLM.

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

        if any(w in q for w in ["सब्सक्रिप्शन", "subscription", "ott"]):
            text = (
                f"आपकी सक्रिय सब्सक्रिप्शन का कुल मासिक खर्च **₹{subs_total:,.0f}** है।\n\n"
                "सलाह: जिन OTT ऐप्स का आप महीने में 2 बार से कम उपयोग करते हैं, उन्हें कैंसिल करने से आप सालाना ₹4,000+ बचा सकते हैं।"
            )
            voice_reply = f"आपके कुल मासिक सब्सक्रिप्शन खर्च {subs_total:,.0f} रुपये हैं।"
            return text, voice_reply, "hi"

        text = (
            f"नमस्ते! आपकी मासिक आय **₹{monthly_income:,.0f}** और मासिक खर्च **₹{monthly_expenses:,.0f}** है। "
            f"मैं आपके वित्तीय प्रबंधन में कैसे सहायता कर सकता हूँ?"
        )
        voice_reply = "नमस्ते! मैं आपका धनमित्र सहायक हूँ। मैं आपके वित्तीय प्रबंधन में कैसे मदद कर सकता हूँ?"
        return text, voice_reply, "hi"

    # English flow
    if any(w in q for w in ["pmjjby", "life insurance", "scheme", "policy"]):
        text = (
            "**Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY):**\n\n"
            "- **Eligibility:** Bank account holders aged 18 to 50 years.\n"
            "- **Coverage:** ₹2,00,000 life insurance on death due to any reason.\n"
            "- **Premium:** ₹436 per year (auto-debited directly from your bank account).\n"
            "- **Feature:** Simple enrollment with no mandatory medical examination."
        )
        voice_reply = "PMJJBY provides 2 lakh rupees life insurance coverage for just 436 rupees per year."
        return text, voice_reply, "en"

    if any(w in q for w in ["tax", "regime", "80c", "deduction"]):
        text = (
            "**Tax Regime Comparison (FY 2024-25):**\n\n"
            "- **New Tax Regime (Default):** Zero tax on taxable income up to ₹7.75 Lakhs with the standard deduction (₹75,000).\n"
            "- **Old Tax Regime:** More beneficial only if your total deductions under 80C (₹1.5L), 80D health insurance, HRA, and home loan interest exceed ₹3.75 Lakhs."
        )
        voice_reply = "Under the New Tax Regime, income up to 7.75 lakh rupees is tax-free with standard deduction."
        return text, voice_reply, "en"

    if has_no_data:
        text = (
            "Welcome to **DhanMITR**!\n\n"
            "I don't see any active income or expense records yet. Head over to **Finance Hub** to set up your income and recurring bills for tailored financial advice."
        )
        voice_reply = "Welcome to DhanMITR. Please add your monthly income and expenses in the Finance Hub to get personalized insights."
        return text, voice_reply, "en"

    if any(w in q for w in ["analyze", "spending", "expense", "breakdown", "outflow"]):
        text = (
            f"Here is your current monthly outflow breakdown totaling **₹{monthly_expenses:,.0f}**:\n\n"
            + (
                "\n".join([f"- **{c.category if hasattr(c, 'category') else c.get('category', '')}:** ₹{c.amount if hasattr(c, 'amount') else c.get('amount', 0):,.0f}" for c in top_categories[:4]])
                if top_categories
                else "- No categorised expense lines recorded."
            )
        )
        voice_reply = f"Your total monthly expenses are {monthly_expenses:,.0f} rupees."
        return text, voice_reply, "en"

    if any(w in q for w in ["save", "saving", "surplus", "budget"]):
        text = (
            f"Your current monthly surplus is **₹{net_surplus:,.0f}** ({savings_rate}% savings rate).\n\n"
            "**Key Optimization Steps:**\n"
            "1. **Follow the 50/30/20 Rule:** 50% Needs, 30% Wants, 20% Savings & Debt.\n"
            "2. **Audit Subscriptions:** Cancel unused services to unlock immediate monthly cashflow.\n"
            "3. **Automate Transfers:** Route surplus directly to index funds or recurring deposits on salary day."
        )
        voice_reply = f"Your monthly surplus is {net_surplus:,.0f} rupees with a {savings_rate} percent savings rate."
        return text, voice_reply, "en"

    if any(w in q for w in ["subscription", "ott", "recurring"]):
        text = (
            f"Your active subscriptions account for **₹{subs_total:,.0f}** per month.\n\n"
            "Pro-Tip: Rotating OTT subscriptions instead of paying for all simultaneously can save ₹4,500+ annually."
        )
        voice_reply = f"You are spending {subs_total:,.0f} rupees monthly on active subscriptions."
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
