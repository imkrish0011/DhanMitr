"""Audio decoding helpers.

Browsers record webm/opus via MediaRecorder, but every ASR model here expects
16 kHz mono PCM wav. Everything funnels through :func:`to_wav16k_mono`.
"""
import base64
import binascii
import os
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path
from typing import Optional

import config


class AudioError(RuntimeError):
    """Raised when audio cannot be decoded or converted."""


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def _temp_path(suffix: str) -> Path:
    """Reserves a temp filename and closes the descriptor.

    mkstemp leaves the fd open, which on Windows keeps a lock on the file and
    makes later unlink() fail with PermissionError.
    """
    fd, name = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    return Path(name)


def decode_base64_audio(audio_base64: str, suffix: str = ".webm") -> Path:
    """Writes a base64 payload (with or without data-URI prefix) to a temp file."""
    if not audio_base64:
        raise AudioError("Empty audio payload.")

    # Strip a "data:audio/webm;base64," style prefix if the client sent one.
    if "," in audio_base64[:100] and audio_base64.lstrip().startswith("data:"):
        audio_base64 = audio_base64.split(",", 1)[1]

    try:
        raw = base64.b64decode(audio_base64, validate=False)
    except (binascii.Error, ValueError) as exc:
        raise AudioError(f"Audio payload is not valid base64: {exc}") from exc

    if not raw:
        raise AudioError("Decoded audio payload is empty.")

    tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    tmp.write(raw)
    tmp.close()
    return Path(tmp.name)


def to_wav16k_mono(src: Path, sample_rate: Optional[int] = None) -> Path:
    """Transcodes any ffmpeg-readable file to mono PCM wav at ``sample_rate``."""
    sample_rate = sample_rate or config.TARGET_SAMPLE_RATE

    if not ffmpeg_available():
        raise AudioError(
            "ffmpeg was not found on PATH. It is required to decode browser "
            "webm/opus recordings. Install it and restart the service."
        )

    dst = _temp_path(".wav")
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(src),
            "-ac", "1",
            "-ar", str(sample_rate),
            "-c:a", "pcm_s16le",
            str(dst),
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0 or not dst.exists() or dst.stat().st_size == 0:
        dst.unlink(missing_ok=True)
        raise AudioError(f"ffmpeg failed to decode the audio: {result.stderr.strip()}")

    return dst


def wav_duration_seconds(path: Path) -> Optional[float]:
    """Returns the duration of a PCM wav file, or None if it cannot be read."""
    try:
        with wave.open(str(path), "rb") as wf:
            rate = wf.getframerate()
            return wf.getnframes() / float(rate) if rate else None
    except (wave.Error, OSError):
        return None


def wav_to_base64(path: Path) -> str:
    return base64.b64encode(Path(path).read_bytes()).decode("ascii")


def make_silence_wav(seconds: float = 1.0, sample_rate: Optional[int] = None) -> Path:
    """Writes a short silent wav. Used to warm models up at startup."""
    sample_rate = sample_rate or config.TARGET_SAMPLE_RATE
    dst = _temp_path(".wav")
    with wave.open(str(dst), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit PCM
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * int(sample_rate * seconds))
    return dst


def samples_to_wav_bytes(samples, sample_rate: int = 24000) -> bytes:
    """Encodes float samples into in-memory 16-bit PCM WAV bytes without disk I/O."""
    import io
    import soundfile as sf
    buf = io.BytesIO()
    sf.write(buf, samples, sample_rate, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def cleanup(*paths: Optional[Path]) -> None:
    """Best-effort removal of temporary files.

    Swallows OSError: on Windows a file can still be locked by a model that has
    not released its handle, and a failed cleanup must never break a request.
    """
    for p in paths:
        if not p:
            continue
        try:
            Path(p).unlink(missing_ok=True)
        except OSError:
            pass
