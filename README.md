# 💰 DhanMITR (धन मित्र)

> **AI-Powered Personal Finance Assistant** — An intelligent companion for real-time net worth tracking, automated tax optimization, budget insights, and conversational voice guidance.

---

## 🏗️ Repository Architecture

DhanMITR is structured as a **clean, modular monorepo** designed so that different team members can independently develop the frontend, voice system, RAG/AI system, and backend integration layer without merge conflicts or cross-dependencies.

```text
dhanmitr/
│
├── ui/         → Next.js + TypeScript + Tailwind + Recharts + Supabase (Frontend)
├── voice/      → Voice / STT / TTS & audio pipeline (Owned by Voice Teammate)
├── rag/        → RAG, LLM retrieval & financial intelligence (Owned by RAG Teammate)
├── backend/    → FastAPI shared API & application orchestration
├── shared/     → Canonical JSON schemas, TypeScript types, Python models & constants
├── docs/       → Architecture, development, and integration documentation
├── main.py     → Root CLI for structure verification and server startup
├── .gitignore  → Comprehensive monorepo gitignore
└── .env.example→ Environment variables template
```

---

## 👥 Folder Ownership & Boundaries

```text
UI       → Frontend (Landing, Dashboard, AI Chat UI, Voice UI, Transactions)
VOICE    → STT / TTS & Audio Processing Pipeline
RAG      → Document Retrieval, Embeddings, Vector Search & LLM Reasoning
BACKEND  → Integration Boundary & API Gateway
SHARED   → Canonical Data Contracts & Type Definitions
DOCS     → Architectural & Development Guides
```

> **Teammate Ownership Rule**:
> - `voice/` and `rag/` contain only `.gitkeep` so teammates have complete freedom to choose their libraries, architectures, models, and directory structures.
> - The **UI** does not import Python code directly.
> - All communication flows via the **Backend** over HTTP, SSE, or WebSocket APIs.

---

## 🚀 Quickstart Guide

### 1. Clone & Configure

```bash
git clone https://github.com/imkrish0011/DhanMitr.git
cd DhanMitr
cp .env.example .env
```

### 2. Verify Monorepo Integrity

```bash
python main.py check
```

---

### 3. Running the Frontend (`ui/`)

```bash
cd ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the landing page, dashboard, AI chat, and voice visualizer.

---

### 4. Running the Backend (`backend/`)

```bash
# In a Python virtual environment:
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

- API Health Check: `http://localhost:8000/health`
- Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 📖 Documentation

- [Architecture & Boundaries](docs/architecture.md)
- [Development Setup Guide](docs/development.md)
- [Integration & API Specifications](docs/integration.md)
- [Shared Schemas & Contracts](shared/)

---

## 📜 License

MIT License. Developed for the DhanMITR personal finance ecosystem.
