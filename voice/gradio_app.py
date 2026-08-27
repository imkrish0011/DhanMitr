"""Gradio test bench for the DhanMITR voice pipeline.

Three tabs, each isolating one thing:

    1. Speech to Text   — audio in, transcript + timings out
    2. Text to Speech   — text in, audio + timings out
    3. Full Pipeline    — audio in, transcript -> reply -> audio out

This exists purely to exercise and measure the pipeline during development.
The production surface is the Next.js UI in ui/, which will reach the same
engines through the backend.

Run:
    voice/.venv/Scripts/python voice/gradio_app.py
"""
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import gradio as gr

import audio_utils
import config
import stt
import tts

# -----------------------------------------------------------------------------
# Voice catalogue — a curated subset of Kokoro's 54 voices, grouped by language.
# -----------------------------------------------------------------------------
KOKORO_VOICES: Dict[str, List[str]] = {
    "en": ["af_bella", "af_heart", "af_nicole", "am_michael", "am_puck"],
    "en-gb": ["bf_emma", "bf_alice", "bm_george", "bm_lewis"],
    "hi": ["hf_alpha", "hf_beta", "hm_omega", "hm_psi"],
}

LANGUAGE_LABELS = {"en": "English (US)", "en-gb": "English (UK)", "hi": "हिंदी / Hindi"}


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def _metrics_table(rows: List[Tuple[str, Any]]) -> str:
    """Renders a small markdown table so timings stay readable in the UI."""
    body = "\n".join(f"| {label} | {value} |" for label, value in rows)
    return f"| Metric | Value |\n| :--- | :--- |\n{body}"


def _error(message: str) -> str:
    return f"### ⚠️ Error\n\n```\n{message}\n```"


def _prepare_audio(path: str) -> Tuple[Path, Optional[Path]]:
    """Normalises any input file to 16 kHz mono wav for the STT engines.

    Returns (wav_to_use, temp_file_to_delete). Gradio usually hands over a wav
    already, but uploads and browser recordings can be anything ffmpeg reads,
    so everything goes through the same conversion the backend will use.
    """
    converted = audio_utils.to_wav16k_mono(Path(path))
    return converted, converted


def _rtf_note(rtf: Optional[float]) -> str:
    """Annotates a real-time factor so the number means something at a glance."""
    if rtf is None:
        return "n/a"
    verdict = "faster than real time" if rtf < 1 else "slower than real time"
    return f"{rtf} ({verdict})"


# -----------------------------------------------------------------------------
# Tab 1 — Speech to Text
# -----------------------------------------------------------------------------
def run_stt(audio_path: Optional[str], provider: str, language: str):
    if not audio_path:
        return "", _error("Record or upload some audio first.")

    temp = None
    try:
        wav, temp = _prepare_audio(audio_path)
        engine = stt.get_stt(provider)
        result = engine.transcribe(wav, language=None if language == "auto" else language)

        metrics = _metrics_table([
            ("Provider", result.provider),
            ("Transcription time", f"{result.latency_ms:.0f} ms"),
            ("Audio duration", f"{result.audio_seconds:.2f} s" if result.audio_seconds else "n/a"),
            ("Real-time factor", _rtf_note(result.rtf)),
            ("Detected script", "Devanagari (Hindi)" if tts.detect_language(result.text) == "hi" else "Latin (English)"),
            ("Characters", len(result.text)),
            ("Device", result.meta.get("device", "—")),
        ])
        return result.text, metrics
    except Exception as exc:
        return "", _error(f"{type(exc).__name__}: {exc}")
    finally:
        audio_utils.cleanup(temp)


# -----------------------------------------------------------------------------
# Tab 2 — Text to Speech
# -----------------------------------------------------------------------------
def run_tts(text: str, provider: str, language: str, voice: str):
    if not (text or "").strip():
        return None, _error("Enter some text to synthesise.")

    try:
        engine = tts.get_tts(provider)
        result = engine.synthesize(text, language=language, voice=voice or None)

        metrics = _metrics_table([
            ("Provider", result.provider),
            ("Voice", result.voice),
            ("Language", LANGUAGE_LABELS.get(result.language, result.language)),
            ("Synthesis time", f"{result.latency_ms:.0f} ms"),
            ("Audio produced", f"{result.audio_seconds:.2f} s" if result.audio_seconds else "n/a"),
            ("Real-time factor", _rtf_note(result.rtf)),
            ("Sample rate", f"{result.sample_rate} Hz"),
        ])
        # The path is handed to Gradio, which reads it before the next call, so
        # it is deliberately not deleted here.
        return str(result.audio_path), metrics
    except Exception as exc:
        return None, _error(f"{type(exc).__name__}: {exc}")


def on_language_change(language: str):
    """Swaps the voice list when the target language changes."""
    voices = KOKORO_VOICES.get(language, KOKORO_VOICES["en"])
    return gr.update(choices=voices, value=voices[0])


# -----------------------------------------------------------------------------
# Tab 3 — Full pipeline
# -----------------------------------------------------------------------------
def generate_reply(transcript: str, language: str) -> str:
    """Stand-in for the RAG layer.

    The rag/ module will own answer generation and plug in here. Until it
    exists, the pipeline echoes the transcript back so the audio loop can be
    measured end to end without waiting on another team.
    """
    if language == "hi":
        return f"आपने कहा: {transcript}"
    return f"You said: {transcript}"


def run_pipeline(audio_path: Optional[str], stt_provider: str, tts_provider: str):
    if not audio_path:
        return "", "", None, _error("Record or upload some audio first.")

    temp = None
    try:
        started = time.perf_counter()

        wav, temp = _prepare_audio(audio_path)
        convert_ms = (time.perf_counter() - started) * 1000

        transcription = stt.get_stt(stt_provider).transcribe(wav)
        language = tts.detect_language(transcription.text)

        reply = generate_reply(transcription.text, language)

        speech = tts.get_tts(tts_provider).synthesize(reply, language=language)
        total_ms = (time.perf_counter() - started) * 1000

        metrics = _metrics_table([
            ("1. Audio conversion", f"{convert_ms:.0f} ms"),
            ("2. Transcription", f"{transcription.latency_ms:.0f} ms (RTF {transcription.rtf})"),
            ("3. Reply generation", "0 ms — stub, awaiting rag/"),
            ("4. Speech synthesis", f"{speech.latency_ms:.0f} ms (RTF {speech.rtf})"),
            ("**Total**", f"**{total_ms:.0f} ms**"),
            ("Reply language", LANGUAGE_LABELS.get(language, language)),
            ("Voice used", speech.voice),
        ])
        return transcription.text, reply, str(speech.audio_path), metrics
    except Exception as exc:
        return "", "", None, _error(f"{type(exc).__name__}: {exc}")
    finally:
        audio_utils.cleanup(temp)


# -----------------------------------------------------------------------------
# Warmup
# -----------------------------------------------------------------------------
def warm_up_models():
    """Loads both engines up front.

    The first call to either model is several times slower than steady state
    (SraVaani ~4x, Kokoro ~8x including its spaCy download), so this exists to
    keep that cost out of the measurements.
    """
    try:
        started = time.perf_counter()
        stt.get_stt().warmup()
        stt_s = time.perf_counter() - started

        started = time.perf_counter()
        tts.get_tts().warmup()
        tts_s = time.perf_counter() - started

        return _metrics_table([
            ("STT loaded", f"{config.STT_PROVIDER} — {stt_s:.1f} s"),
            ("TTS loaded", f"{config.TTS_PROVIDER} — {tts_s:.1f} s"),
            ("Device", config.resolve_device()),
            ("Status", "✅ ready — timings below are now steady-state"),
        ])
    except Exception as exc:
        return _error(f"{type(exc).__name__}: {exc}")


# -----------------------------------------------------------------------------
# Interface
# -----------------------------------------------------------------------------
SAMPLE_EN = "Your emergency fund is fully funded at three lakh sixty thousand rupees, and your savings rate is fifty three percent."
SAMPLE_HI = "आपका इमरजेंसी फंड तीन लाख साठ हज़ार रुपये है। आपकी मासिक बचत दर तिरपन प्रतिशत है।"


def build_ui() -> gr.Blocks:
    with gr.Blocks(title="DhanMITR Voice Pipeline", theme=gr.themes.Soft()) as demo:
        gr.Markdown(
            "# 🎙️ DhanMITR Voice Pipeline\n"
            f"**STT:** `{config.STT_PROVIDER}` · **TTS:** `{config.TTS_PROVIDER}` · "
            f"**Device:** `{config.resolve_device()}`\n\n"
            "Development test bench. The first run of either model is slow — "
            "warm them up once for accurate timings."
        )

        with gr.Row():
            warm_btn = gr.Button("🔥 Warm up models", variant="secondary", scale=1)
            warm_status = gr.Markdown(scale=3)
        warm_btn.click(warm_up_models, outputs=warm_status)

        with gr.Tabs():
            # ---------------------------------------------------------------
            with gr.Tab("1 · Speech → Text"):
                gr.Markdown("Record or upload audio and inspect the transcript.")
                with gr.Row():
                    with gr.Column():
                        stt_audio = gr.Audio(
                            sources=["microphone", "upload"],
                            type="filepath",
                            label="Input audio",
                        )
                        with gr.Row():
                            stt_provider = gr.Dropdown(
                                choices=list(stt.available_providers()),
                                value=config.STT_PROVIDER,
                                label="STT engine",
                            )
                            stt_lang = gr.Dropdown(
                                choices=["auto", "en", "hi"],
                                value="auto",
                                label="Language hint",
                                info="SraVaani auto-detects; the hint only affects Whisper.",
                            )
                        stt_btn = gr.Button("Transcribe", variant="primary")

                    with gr.Column():
                        stt_text = gr.Textbox(
                            label="Transcript",
                            lines=8,
                            buttons=["copy"],
                            placeholder="The transcript will appear here…",
                        )
                        stt_metrics = gr.Markdown()

                stt_btn.click(
                    run_stt,
                    inputs=[stt_audio, stt_provider, stt_lang],
                    outputs=[stt_text, stt_metrics],
                )

            # ---------------------------------------------------------------
            with gr.Tab("2 · Text → Speech"):
                gr.Markdown("Synthesise speech and compare voices and languages.")
                with gr.Row():
                    with gr.Column():
                        tts_text = gr.Textbox(
                            label="Text to speak",
                            lines=6,
                            value=SAMPLE_EN,
                        )
                        with gr.Row():
                            tts_provider = gr.Dropdown(
                                choices=list(tts.available_providers()),
                                value=config.TTS_PROVIDER,
                                label="TTS engine",
                            )
                            tts_lang = gr.Dropdown(
                                choices=list(KOKORO_VOICES),
                                value="en",
                                label="Language",
                            )
                            tts_voice = gr.Dropdown(
                                choices=KOKORO_VOICES["en"],
                                value=KOKORO_VOICES["en"][0],
                                label="Voice",
                            )
                        with gr.Row():
                            tts_btn = gr.Button("Synthesise", variant="primary")
                            gr.Button("Load Hindi sample").click(
                                lambda: SAMPLE_HI, outputs=tts_text
                            )

                    with gr.Column():
                        tts_audio = gr.Audio(label="Generated speech", type="filepath")
                        tts_metrics = gr.Markdown()

                tts_lang.change(on_language_change, inputs=tts_lang, outputs=tts_voice)
                tts_btn.click(
                    run_tts,
                    inputs=[tts_text, tts_provider, tts_lang, tts_voice],
                    outputs=[tts_audio, tts_metrics],
                )

            # ---------------------------------------------------------------
            with gr.Tab("3 · Full Pipeline"):
                gr.Markdown(
                    "Speak → transcribe → generate a reply → speak it back.\n\n"
                    "Reply language is chosen from the transcript's script "
                    "(Devanagari → Hindi). Reply text is a stub until `rag/` lands."
                )
                with gr.Row():
                    with gr.Column():
                        pipe_audio = gr.Audio(
                            sources=["microphone", "upload"],
                            type="filepath",
                            label="Speak your question",
                        )
                        with gr.Row():
                            pipe_stt = gr.Dropdown(
                                choices=list(stt.available_providers()),
                                value=config.STT_PROVIDER,
                                label="STT engine",
                            )
                            pipe_tts = gr.Dropdown(
                                choices=list(tts.available_providers()),
                                value=config.TTS_PROVIDER,
                                label="TTS engine",
                            )
                        pipe_btn = gr.Button("Run full pipeline", variant="primary")

                    with gr.Column():
                        pipe_transcript = gr.Textbox(
                            label="1 · Transcript", lines=3, buttons=["copy"]
                        )
                        pipe_reply = gr.Textbox(
                            label="2 · Reply (stub)", lines=3, buttons=["copy"]
                        )
                        pipe_audio_out = gr.Audio(label="3 · Spoken reply", type="filepath")
                        pipe_metrics = gr.Markdown()

                pipe_btn.click(
                    run_pipeline,
                    inputs=[pipe_audio, pipe_stt, pipe_tts],
                    outputs=[pipe_transcript, pipe_reply, pipe_audio_out, pipe_metrics],
                )

    return demo


if __name__ == "__main__":
    build_ui().launch(server_name="127.0.0.1", server_port=7860, show_error=True)
