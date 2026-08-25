"""Language Auto-Detection Engine for DhanMITR.

Supports:
1. Devanagari script detection (Hindi, Marathi, etc.)
2. Romanized Hindi (Hinglish) functional grammar & question marker detection
3. English syntax & interrogative functional word detection
4. Language hint integration
5. Canonical ISO language resolution ('hi' vs 'en')
"""

import re
from typing import Optional, Tuple

# English structural words, interrogatives, prepositions, auxiliary verbs & pronouns
ENGLISH_FUNCTIONAL_TOKENS = {
    # Question words & interrogatives
    "what", "whats", "what's", "where", "wheres", "where's", "when", "whens",
    "why", "how", "who", "which", "whose", "whom",

    # Auxiliary verbs & modals
    "is", "are", "am", "was", "were", "be", "been", "being",
    "do", "does", "did", "have", "has", "had",
    "can", "could", "should", "would", "will", "shall", "may", "might", "must",

    # Common verbs & query directives
    "tell", "explain", "show", "give", "list", "check", "calculate", "compare",
    "analyze", "analyse", "help", "need", "want", "know", "find", "get", "apply",
    "describe", "summarize", "summarise", "breakdown", "guide", "please",

    # Pronouns & determiners
    "i", "me", "my", "mine", "myself", "you", "your", "yours", "yourself",
    "we", "us", "our", "ours", "he", "him", "his", "she", "her", "hers",
    "they", "them", "their", "theirs", "it", "its", "this", "that", "these", "those",

    # Prepositions & conjunctions
    "the", "a", "an", "for", "to", "of", "in", "on", "at", "with", "from", "by",
    "about", "into", "through", "during", "before", "after", "above", "below",
    "and", "or", "but", "if", "because", "as", "until", "while", "between", "difference",
}

# Romanized Hindi (Hinglish) functional words, verbs, pronouns & interrogatives
HINGLISH_FUNCTIONAL_TOKENS = {
    # Question words & interrogatives
    "kya", "kyu", "kyun", "kaise", "kaisa", "kaisi", "kitna", "kitni", "kitne",
    "kab", "kaha", "kahan", "kaun", "kisko", "kisse", "kiski", "kiska", "kispe", "kinhe",

    # Pronouns & possessives
    "mera", "meri", "mere", "mujhe", "mujhko", "hum", "humein", "humara", "humari",
    "humare", "aap", "aapka", "aapki", "aapke", "tum", "tumhara", "tumhari", "tumhare",
    "uska", "uski", "uske", "unka", "unki", "unke", "inhe", "unhe", "apna", "apni", "apne",
    "main", "mai",

    # Auxiliary verbs & tense markers
    "hai", "hain", "hoon", "hun", "hu", "ho", "tha", "thi", "the", "hoga", "hogi", "hoge",
    "raha", "rahi", "rahe", "chahiye", "chahta", "chahti", "chahte",

    # Action verbs & commands
    "karo", "kare", "karein", "karna", "karni", "karne", "batao", "bataiye", "bataana",
    "samjhao", "dikhaye", "dikhao", "milega", "milegi", "milenge", "sakta", "sakti", "sakte",
    "lagta", "lagti", "lagte", "hota", "hoti", "hote", "jaata", "jaati", "jaate",
    "diya", "diye", "liya", "liye", "paana", "paane",

    # Conjunctions, particles, prepositions
    "ke", "ki", "ko", "se", "me", "mein", "par", "pe", "bhi", "toh", "to", "nahi", "nahin",
    "mat", "baare", "liye", "wala", "wali", "wale",

    # Hinglish conversational vocabulary
    "kharch", "kharcha", "kharche", "bachat", "byaj", "byaaj", "karz", "rin", "kamai",
    "vetan", "nivesh", "faayda", "fayda", "fayde", "nuksan", "labh", "sarkari",
}

# Regex to check Devanagari script codepoints (\u0900 to \u097f)
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097f]")

# Word boundary regex compiler
WORD_TOKEN_REGEX = re.compile(r"[a-zA-Z']+")


def detect_language(text: Optional[str], language_hint: Optional[str] = None) -> Tuple[str, str]:
    """Auto-detects language from text and hints, returning (language_code, reason).

    Priority:
    1. Direct Devanagari script presence in text -> 'hi'
    2. English grammatical structure & interrogatives -> 'en' (even when loan scheme words like 'yojana' are mentioned)
    3. Hinglish grammatical structure & interrogatives -> 'hi'
    4. Explicit language hint ('hi' vs 'en')
    5. Default English fallback

    Returns:
        tuple[str, str]: ('hi' | 'en', detection_reason)
    """
    cleaned_text = (text or "").strip()
    if not cleaned_text:
        if language_hint and language_hint.strip().lower() in ("hi", "hindi", "hin"):
            return "hi", "language_hint_hindi"
        return "en", "empty_fallback"

    # 1. Check for Devanagari Script (Highest confidence)
    devanagari_chars = DEVANAGARI_REGEX.findall(cleaned_text)
    if devanagari_chars:
        return "hi", f"devanagari_script (found {len(devanagari_chars)} devanagari characters)"

    # 2. Tokenize into lowercase words
    tokens = [t.lower().strip("'") for t in WORD_TOKEN_REGEX.findall(cleaned_text) if t.strip("'")]
    if tokens:
        english_matches = [t for t in tokens if t in ENGLISH_FUNCTIONAL_TOKENS]
        hinglish_matches = [t for t in tokens if t in HINGLISH_FUNCTIONAL_TOKENS]

        eng_count = len(english_matches)
        hin_count = len(hinglish_matches)

        # Clear English grammatical structure takes precedence (e.g. "what is PM kisan yojana?", "tell me about Atal Pension Yojana")
        if eng_count >= 2 and eng_count >= hin_count:
            return "en", f"english_syntax (matched: {', '.join(english_matches[:4])})"

        # Definite Hinglish structure (e.g. "kisan yojana kya hai", "mere kharche batao", "kaise apply kare")
        if hin_count >= 2 and hin_count > eng_count:
            return "hi", f"hinglish_syntax (matched: {', '.join(hinglish_matches[:4])})"

        # Single indicator with no conflict
        if hin_count >= 1 and eng_count == 0:
            return "hi", f"hinglish_keyword (matched: {hinglish_matches[0]})"

        if eng_count >= 1 and hin_count == 0:
            return "en", f"english_keyword (matched: {english_matches[0]})"

    # 3. Check language hint (e.g. from UI selector or STT)
    if language_hint:
        hint_clean = language_hint.strip().lower()
        if hint_clean in ("hi", "hindi", "hin"):
            return "hi", "language_hint_hindi"
        if hint_clean in ("en", "english", "eng"):
            return "en", "language_hint_english"

    return "en", "default_english"

