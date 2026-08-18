# 💰 DhanMITR (धन मित्र)

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)

**AI-Powered Personal Finance & Wealth Intelligence Companion**

*An intelligent, multilingual financial advisor for real-time net worth tracking, automated tax optimization, budget insights, government scheme discovery, and conversational voice guidance.*

</div>

---

## ✨ Key Features

- 🎙️ **Multilingual Voice Assistant**: Natural, real-time speech-to-text (STT) and conversational voice interaction in Hindi and English.
- 📚 **RAG Financial Intelligence**: Retrieval-augmented generation powered by curated Indian government financial schemes (PMJJBY, PMSBY, APY, NPS, Atal Pension, Sukanya Samriddhi) and RBI guidelines.
- 📊 **Real-time Wealth Analytics**: Interactive portfolio and net worth tracking with dynamic charts and asset breakdown (Equity, Debt, Real Estate, Gold, Cash).
- 💡 **AI Financial Companion**: Context-aware chat assistant providing tailored financial guidance, savings suggestions, and investment planning.
- 🧾 **Tax & Budget Optimization**: Smart insights for tax-saving allocations under 80C/80D/NPS and category-wise spending analysis.
- 🔒 **Secure & Modular Architecture**: Built as an enterprise-grade monorepo separating UI, Backend, Voice, and RAG modules.

---

## 🏗️ Repository Architecture

DhanMITR is structured as a **clean, modular monorepo** enabling independent development across frontend, voice engineering, RAG/AI systems, and backend services.

```text
DhanMitr/
├── ui/         → Next.js 15 + TypeScript + Tailwind CSS + Lucide + Recharts + Supabase
├── backend/    → FastAPI backend API & orchestration gateway
├── voice/      → Speech-to-Text (STT), TTS, and audio processing pipeline
├── rag/        → RAG pipeline, document scraping, chunking, embeddings & vector DB
├── shared/     → Canonical JSON schemas, TypeScript types, Python models & contracts
├── docs/       → Architecture, integration specs, and development guides
├── main.py     → Monorepo CLI for structure verification and service launching
├── .gitignore  → Comprehensive root gitignore
└── .env.example→ Root environment variables template
```

---

## 👥 Module Ownership & Tech Stack

| Module | Purpose | Tech Stack |
| :--- | :--- | :--- |
| **`ui/`** | Web & Mobile UI, Dashboards, AI Chat, Voice Visualizer | Next.js 15, TypeScript, Tailwind CSS, Recharts, Supabase |
| **`backend/`** | Integration gateway, REST APIs, Session & Chat orchestration | FastAPI, Uvicorn, Pydantic |
| **`voice/`** | Audio pipeline, Speech Recognition, Multilingual STT | Python, SpeechRecognition, PyAudio |
| **`rag/`** | Knowledge retrieval, Government schemes, RBI data, Vector search | Python, LangChain, ChromaDB / FAISS, BeautifulSoup4 |
| **`shared/`** | Canonical data contracts & cross-platform types | JSON Schema, TypeScript Definitions, Pydantic Models |

---

## 🚀 Quickstart Guide

### 1. Clone the Repository

```bash
git clone https://github.com/imkrish0011/DhanMitr.git
cd DhanMitr
cp .env.example .env
```

### 2. Monorepo Verification

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Running the Backend API (`backend/`)

```bash
# In a Python virtual environment:
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

- **API Health Check**: `http://localhost:8000/health`
- **Swagger Documentation**: `http://localhost:8000/docs`

---

### 5. Running RAG Data Collection & Vector DB (`rag/`)

```bash
pip install -r rag/requirements.txt

# Run government scheme data cleaner
python rag/scripts/cleaning/clean_scheme.py \
  rag/data/periodic/government_schemes/raw/pmjjby_new_raw.json \
  rag/data/periodic/government_schemes/cleaned/pmjjby_new_cleaned.json
```

---

## 📖 Documentation

- [Architecture & Boundaries](docs/architecture.md)
- [Development Setup Guide](docs/development.md)
- [Integration & API Specifications](docs/integration.md)
- [Shared Schemas & Contracts](shared/)

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information. Developed for the DhanMITR personal finance ecosystem.
