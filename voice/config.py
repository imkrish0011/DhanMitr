"""Configuration for the DhanMITR voice module.

Loads the root .env first, then voice/.env (which wins) so the voice module can
be tuned independently without touching shared team configuration.
"""
import os
from pathlib import Path

VOICE_DIR = Path(__file__).resolve().parent
ROOT_DIR = VOICE_DIR.parent
MODELS_DIR = VOICE_DIR / "models"  # Piper .onnx voice files live here

try:
    from dotenv import load_dotenv

    load_dotenv(ROOT_DIR / ".env")
    load_dotenv(VOICE_DIR / ".env", override=True)
except ImportError:  # python-dotenv is optional; shell env still works
    pass


# -----------------------------------------------------------------------------
# Provider selection
# -----------------------------------------------------------------------------
STT_PROVIDER = os.getenv("STT_PROVIDER", "sravaani").strip().lower()  # sravaani | faster_whisper | mock
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "kokoro").strip().lower()    # kokoro | piper | mock

# -----------------------------------------------------------------------------
# STT — SraVaani-1.0 (gated; authenticate with `hf auth login` or HF_TOKEN)
# -----------------------------------------------------------------------------
SRAVAANI_REPO = os.getenv("SRAVAANI_REPO", "ARTPARK-IISc/SraVaani-1.0")
HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")

# STT — faster-whisper fallback
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

# -----------------------------------------------------------------------------
# TTS — Kokoro-82M. Voice prefixes encode language + gender:
# af/am = American English, bf/bm = British English, hf/hm = Hindi.
# -----------------------------------------------------------------------------
KOKORO_REPO = os.getenv("KOKORO_REPO", "hexgrad/Kokoro-82M")
KOKORO_VOICE_EN = os.getenv("KOKORO_VOICE_EN", "af_bella")
KOKORO_VOICE_EN_GB = os.getenv("KOKORO_VOICE_EN_GB", "bf_emma")
KOKORO_VOICE_HI = os.getenv("KOKORO_VOICE_HI", "hf_alpha")
KOKORO_SAMPLE_RATE = 24000  # fixed by the model

# TTS — Piper (optional, for Indic languages Kokoro cannot speak)
PIPER_SAMPLE_RATE = 22050

# -----------------------------------------------------------------------------
# Runtime
# -----------------------------------------------------------------------------
DEVICE = os.getenv("VOICE_DEVICE", "auto")  # 'auto' | 'cuda' | 'cpu'
TARGET_SAMPLE_RATE = int(os.getenv("AUDIO_SAMPLE_RATE", "16000"))  # STT input rate


def resolve_device() -> str:
    """Resolves the configured device, falling back to CPU when CUDA is absent."""
    if DEVICE != "auto":
        return DEVICE
    try:
        import torch

        return "cuda" if torch.cuda.is_available() else "cpu"
    except ImportError:
        return "cpu"
