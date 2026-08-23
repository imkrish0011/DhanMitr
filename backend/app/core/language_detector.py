"""Language Auto-Detection Engine for DhanMITR.

Supports:
1. Devanagari script detection (Hindi, Marathi, etc.)
2. Common Romanized Hindi (Hinglish) keyword & phrase detection
3. STT language hint integration
4. Canonical ISO language resolution ('hi' vs 'en')
"""

import re
from typing import Optional, Tuple

# Comprehensive vocabulary of Romanized Hindi / Hinglish tokens & stems
HINGLISH_KEYWORDS = {
    # Question words & interrogatives
    "kya", "kyu", "kyun", "kaise", "kaisa", "kaisi", "kitna", "kitni", "kitne",
    "kab", "kaha", "kahan", "kaun", "kisko", "kisse", "kiski", "kiska", "kispe",

    # Pronouns & possessives
    "mera", "meri", "mere", "mujhe", "mujhko", "hum", "humein", "humara",
    "humari", "humare", "aap", "aapka", "aapki", "aapke", "tum", "tumhara",
    "tumhari", "tumhare", "uska", "uski", "uske", "unka", "unki", "unke",

    # Common financial and daily terms
    "yojana", "yojna", "paisa", "paise", "rupaya", "rupaye", "kharch", "kharcha",
    "kharche", "bachat", "byaj", "byaaj", "karz", "rin", "khata", "bima",
    "kist", "sudh", "kamai", "vetan", "vetanbhogi", "nivesh", "faayda", "fayda",
    "fayde", "nuksan", "labh", "sarkari", "yojnaen", "yojanaon", "dhan", "mitr",

    # Auxiliary & common verbs
    "hai", "hain", "hoon", "hun", "ho", "tha", "thi", "the", "hoga", "hogi",
    "hoge", "karo", "kare", "karein", "karna", "karni", "karne", "batao",
    "bataiye", "bataana", "samjhao", "dikhaye", "dikhao", "milega", "milegi",
    "milenge", "chahiye", "chahta", "chahti", "chahte", "sakta", "sakti", "sakte",
    "lagta", "lagti", "lagte", "hota", "hoti", "hote", "jaata", "jaati", "jaate",
    "diya", "diye", "liya", "liye", "raha", "rahi", "rahe",
}

# Regex to check Devanagari script codepoints (\u0900 to \u097f)
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097f]")

# Word boundary regex compiler for Hinglish tokens
WORD_TOKEN_REGEX = re.compile(r"[a-zA-Z]+")


def detect_language(text: Optional[str], language_hint: Optional[str] = None) -> Tuple[str, str]:
    """Auto-detects language from text and hints, returning (language_code, reason).

    Priority:
    1. Direct Devanagari script presence in text
    2. Hinglish / Romanized Hindi keywords in text
    3. Explicit STT audio language identification ('hi')
    4. Explicit language hint ('hi' vs 'en')
    5. Default English fallback

    Returns:
        tuple[str, str]: ('hi' | 'en', detection_reason)
    """
    cleaned_text = (text or "").strip()

    # 1. Check for Devanagari Script (Highest confidence)
    if cleaned_text:
        devanagari_chars = DEVANAGARI_REGEX.findall(cleaned_text)
        if devanagari_chars:
            return "hi", f"devanagari_script (found {len(devanagari_chars)} devanagari characters)"

        # 2. Check for Romanized Hindi (Hinglish) tokens
        tokens = [t.lower() for t in WORD_TOKEN_REGEX.findall(cleaned_text)]
        if tokens:
            hinglish_matches = [t for t in tokens if t in HINGLISH_KEYWORDS]
            ratio = len(hinglish_matches) / len(tokens)
            if len(hinglish_matches) >= 2 or (len(hinglish_matches) >= 1 and ratio >= 0.20):
                return "hi", f"hinglish_keywords (matched: {', '.join(hinglish_matches[:4])})"

    # 3. Check language hint (e.g. from Whisper acoustic language ID or UI selector)
    if language_hint:
        hint_clean = language_hint.strip().lower()
        if hint_clean in ("hi", "hindi", "hin"):
            return "hi", "stt_audio_language_hindi"
        if hint_clean in ("en", "english", "eng"):
            return "en", "stt_audio_language_english"

    if not cleaned_text:
        return "en", "empty_fallback"

    return "en", "default_english"
