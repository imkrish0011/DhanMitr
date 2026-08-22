"""DhanMITR Voice processing module.

Includes SraVaani STT and Kokoro TTS pipeline wrappers.
"""
import sys
from pathlib import Path

_voice_dir = str(Path(__file__).resolve().parent)
if _voice_dir not in sys.path:
    sys.path.insert(0, _voice_dir)
