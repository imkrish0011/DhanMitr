# DhanMITR Architecture & Module Boundaries

This document defines the high-level system architecture, module ownership, and integration contracts for the **DhanMITR** AI-powered personal finance assistant monorepo.

---

## 🏗️ System Overview

```text
                           DHANMITR MONOREPO
                                   │
                                   ▼
                           UI (Next.js / TS)
                                   │
                                   ▼  HTTP / SSE / WebSocket
                        BACKEND (FastAPI API Layer)
                                 /           \
                                /             \
                               ▼               ▼
                      RAG / AI SYSTEM     VOICE SYSTEM
                      (Owned by RAG)     (Owned by Voice)
                               │               │
                               └───────┬───────┘
                                       ▼
                               SHARED CONTRACTS
```

---

## 👥 Folder Ownership & Responsibilities

| Directory | Owner / Teammate | Core Responsibilities |
| :--- | :--- | :--- |
| **`ui/`** | **Frontend Engineer** | Next.js 14 App Router, Tailwind CSS, shadcn/ui components, Supabase auth client, Financial dashboards, Recharts, Forms, Responsive UX. |
| **`voice/`** | **Voice / Audio Engineer** | Speech-to-Text (STT), Text-to-Speech (TTS), Audio streaming, Voice Activity Detection, low-latency audio pipelines. |
| **`rag/`** | **AI / RAG Engineer** | Vector database integrations, document embeddings, tax & financial heuristics, prompt engineering, LLM inference & streaming. |
| **`backend/`** | **Backend / Integration Engineer** | FastAPI orchestrator, API endpoints, session verification, coordinating requests between UI, RAG, and Voice. |
| **`shared/`** | **All Team Members** | Language-agnostic contracts (JSON schemas, TypeScript types, Python models, constants). |
| **`docs/`** | **All Team Members** | Architecture documentation, API specifications, onboarding guides. |

---

## 🔒 Architectural Golden Rules

1. **Independent Replaceability**: Each module must remain completely decoupled. The UI must never directly import Python modules.
2. **Empty Teammate Folders**: The `voice/` and `rag/` folders contain `.gitkeep` files waiting for the respective teammates to build their implementations from scratch without preconceived constraints.
3. **Integration Boundary**: The `backend/` layer serves as the single integration gateway between the UI and AI/Voice services.
4. **Contract-First Evolution**: Any modifications to data contracts must be introduced in `shared/schemas/` and agreed upon before updating consumer modules.
