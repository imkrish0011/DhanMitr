# 💰 DhanMITR (धन मित्र)

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase&logoColor=white)

**AI-Powered Personal Finance & Wealth Intelligence Companion**

*An intelligent, multilingual financial advisor for real-time net worth tracking, automated tax optimization, budget insights, government scheme discovery, live market data, and conversational voice guidance.*

</div>

---

## ✨ Key Features

- 🎙️ **Multilingual Conversational Voice Assistant**:
  - High-performance, low-latency speech transcription (STT) optimized for English and Indian accents/languages.
  - Natural speech synthesis (TTS) supporting conversational Hindi and English voice outputs.
  - Interactive live audio waveform and visualizer for conversational voice banking.

- 📚 **RAG Financial Intelligence & Scheme Discovery**:
  - Grounded question answering powered by official Indian government schemes (**PMJJBY, PMSBY, APY, NPS, Atal Pension, Sukanya Samriddhi, PM-Kisan, SCSS**).
  - Regulatory knowledge retrieval covering **RBI notifications, SEBI guidelines, DEA, and NSE circulars**.
  - High-dimensional vector embeddings with **Supabase pgvector** HNSW indexing and verifiable source citations.

- 📈 **Live Financial Intelligence Router**:
  - Real-time **Precious Metals** tracking (Gold 22K/24K and Silver spot rates).
  - Live **Forex** exchange rates (USD/INR, EUR/INR, GBP/INR, etc.).
  - Up-to-date **RBI Policy Rates** (Repo, Reverse Repo, MSF, SDF, CRR, SLR).
  - Real-time **Stock & Crypto** lookups (NSE/BSE equities, major cryptocurrencies).
  - Integrated dynamic web search for market context on un-indexed queries.

- 📊 **Real-time Wealth & Cash Flow Analytics**:
  - Interactive portfolio tracking, asset allocation breakdown (Equity, Debt, Real Estate, Gold, Cash), and net worth monitoring.
  - Visual cash flow trends and category-wise spending analysis (Needs vs. Wants vs. Investments).
  - **Emergency Runway Gauge** calculating months of liquidity buffer based on recurring expenses.

- 🧾 **Tax & Loan Planning Calculators**:
  - **Old vs. New Tax Regime Comparator**: Interactive tax liability breakdown under Section 80C, 80D, 80CCD (NPS), and standard deductions.
  - **Project Loan Suite**: Comprehensive EMI, loan amortization, and payoff planning calculators.
  - **Financial Goals Tracker**: Multi-horizon goal planning with progress monitoring.

- 🔁 **Recurring Expense & Policy Management**:
  - Subscription management with active status, monthly/yearly billing cycles, and spend categorization.
  - Insurance policy tracking (Health, Term Life, Motor) with coverage values, premium cycles, and renewal alerts.

- 📱 **Native Mobile Finance Hub**:
  - Dedicated mobile-optimized dashboard view designed for touch-first navigation.

- 🛡️ **Enterprise Admin Portal & RBAC**:
  - Secure `/admin` dashboard with Role-Based Access Control (Superadmin, Admin, Moderator).
  - User profile management, system-wide analytics, and audit logging.

- ⚡ **Streaming Chat Assistant**:
  - Real-time token streaming with speech-friendly summaries, follow-up recommendations, and source links.

---

## 🏗️ Repository Architecture

DhanMITR is structured as a **modular monorepo** separating UI, backend orchestration, audio engineering, and knowledge retrieval:

```text
DhanMitr/
├── ui/         → Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Lucide + Recharts + Supabase
├── backend/    → FastAPI backend API gateway, model warmups, session & chat orchestration
├── voice/      → Speech-to-Text (STT), TTS, audio transcoding, and voice activity pipeline
├── rag/        → Document scrapers, embeddings, vector retrieval & live market router
├── shared/     → Canonical JSON schemas, TypeScript types, Python Pydantic models & contracts
├── docs/       → Architecture blueprints, integration specs, and administrative guides
├── main.py     → Monorepo CLI for service launching and checks
├── .gitignore  → Comprehensive root gitignore
└── .env.example→ Root environment variables template
```

---

## 👥 Module Overview & Tech Stack

| Module | Purpose | Tech Stack |
| :--- | :--- | :--- |
| **`ui/`** | Web & Mobile UI, Dashboards, AI Chat, Voice Visualizer, Admin Panel | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Framer Motion, Supabase Auth |
| **`backend/`** | Integration gateway, REST APIs, Model warmups, RAG & Voice orchestration | FastAPI, Uvicorn, Pydantic v2, Python 3.10+ |
| **`voice/`** | Audio pipeline, Multilingual STT & TTS, format transcoding | Whisper STT, Kokoro TTS, Edge TTS, PyAudio, SoundFile |
| **`rag/`** | Vector retrieval, Scheme ingestion, BGE-M3 embeddings, Live market data | BGE-M3, LangChain, Supabase pgvector, BeautifulSoup4, yfinance |
| **`shared/`** | Canonical data contracts & cross-platform types | JSON Schema, TypeScript Definitions, Pydantic Models |
| **`docs/`** | System architecture, integration contracts & admin guides | Markdown |

---

## 🚀 Quickstart Guide

### 1. Clone the Repository & Configure Environment

```bash
git clone <repository-url>
cd DhanMitr
cp .env.example .env
```

Configure your application credentials in `.env` by referring to `.env.example`.

---

### 2. Database Setup (Supabase)

Execute the database schema in your Supabase SQL Editor:
- Run [`ui/supabase_schema.sql`](ui/supabase_schema.sql) to provision tables (`profiles`, `subscriptions`, `insurances`, `budget_items`, `transactions`, `admin_users`, `admin_audit_logs`) and enable Row Level Security (RLS).
- Ensure the `pgvector` extension and vector similarity matching RPC are enabled.

---

### 3. Running the Frontend (`ui/`)

```bash
cd ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
The Admin dashboard is accessible at [http://localhost:3000/admin](http://localhost:3000/admin).

---

### 4. Running the Backend API (`backend/`)

```bash
# From repository root in a Python 3.10+ virtual environment:
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

Alternatively, launch using the root CLI:
```bash
python main.py backend
```

- **API Health Check**: `http://localhost:8000/health`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### 5. Setting Up the Voice Subsystem (`voice/`)

```bash
# In your Python virtual environment:
pip install -r voice/requirements.txt
```

Voice configuration options can be tuned in `voice/config.py` or through your `.env` configuration file.

---

### 6. RAG Pipeline & Live Market Data (`rag/`)

```bash
# Install RAG dependencies:
pip install -r rag/requirements.txt

# Run government scheme collection & cleaning:
python rag/scripts/collect/collect_scheme.py --help
python rag/scripts/cleaning/clean_scheme.py --help

# Generate vector embeddings:
python rag/scripts/embeddings/generate_embeddings.py

# Test retrieval:
python rag/scripts/retrieval/test_retrieval.py
```

---

## 📖 Documentation

- [Architecture & Boundaries](docs/architecture.md)
- [Development Setup Guide](docs/development.md)
- [Integration & API Specifications](docs/integration.md)
- [Admin Portal Guide](docs/admin_guide.md)
- [Shared Schemas & Contracts](shared/)

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information. Developed for the DhanMITR personal finance ecosystem.
