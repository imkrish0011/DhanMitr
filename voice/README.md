# 🎙️ DhanMITR Voice Module

Speech-to-Text (STT) and Text-to-Speech (TTS) pipeline tailored for Indian personal finance guidance (Hindi & English).

---

## ⚙️ 1. Prerequisites

* **Python 3.11 or 3.12** *(Kokoro requires Python < 3.13)*
* **System Binaries**:
  * **Windows**: `winget install Gyan.FFmpeg` and `winget install eSpeak-NG.eSpeak-NG`
  * **macOS**: `brew install ffmpeg espeak-ng`
  * **Linux**: `sudo apt install ffmpeg espeak-ng`

---

## 🚀 2. Quickstart Setup

```bash
# 1. Create and activate a dedicated virtual environment
py -3.11 -m venv voice/.venv
voice\.venv\Scripts\activate      # Windows
# source voice/.venv/bin/activate  # macOS / Linux

# 2. Install PyTorch CPU (saves ~2.5 GB download)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# 3. Install requirements
pip install -r voice/requirements.txt

# 4. Launch the Gradio Test Bench
python voice/gradio_app.py
```

Open **`http://127.0.0.1:7860`** in your browser to test Speech-to-Text, Text-to-Speech, and the full conversational loop.

---

## 🔧 3. Configuration (`.env`)

Tune settings in your root `.env` or `voice/.env`:

| Variable | Options | Default | Description |
| :--- | :--- | :--- | :--- |
| `STT_PROVIDER` | `sravaani`, `faster_whisper`, `mock` | `sravaani` | Speech-to-Text engine |
| `TTS_PROVIDER` | `kokoro`, `piper`, `mock` | `kokoro` | Text-to-Speech engine |
| `HF_TOKEN` | `hf_...` | — | Required for gated SraVaani model |
| `VOICE_DEVICE` | `auto`, `cuda`, `cpu` | `auto` | Hardware compute device |

> **💡 Quick Testing Tip**: Set `STT_PROVIDER=mock` and `TTS_PROVIDER=mock` to test the pipeline instantly without loading neural weights.
