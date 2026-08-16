# Local Development Guide

This guide walks every team member through setting up and running their part of **DhanMITR**.

---

## 📋 Prerequisites

- **Node.js**: v18.17+ or v20+ (`node -v`)
- **Python**: v3.10+ (`python --version`)
- **Git**: Installed and configured

---

## 🚀 Quickstart

### 1. Clone & Setup Environment

```bash
git clone https://github.com/imkrish0011/DhanMitr.git
cd DhanMitr
cp .env.example .env
```

---

### 2. Frontend Development (`ui/`)

```bash
cd ui
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. Backend Development (`backend/`)

```bash
# From project root:
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
Health check available at [http://localhost:8000/health](http://localhost:8000/health).

---

### 4. Voice System Development (`voice/`)

The `voice/` folder is reserved for the **Voice Teammate**.
1. Place your STT, TTS, and audio streaming pipeline directly inside `voice/`.
2. Add your dependencies to a `voice/requirements.txt`.
3. Expose an API or function interface for the `backend/` to consume.

---

### 5. RAG / AI System Development (`rag/`)

The `rag/` folder is reserved for the **RAG Teammate**.
1. Place your embeddings, vector search, document retrievers, and LLM reasoning pipeline inside `rag/`.
2. Add your dependencies to a `rag/requirements.txt`.
3. Expose an API or function interface for the `backend/` to consume.

---

## 🛠️ Root Orchestrator CLI

You can use the root `main.py` script to verify your workspace status:

```bash
python main.py check
```
