# Integration & Communication Protocols

This document details how the **UI**, **Backend**, **RAG**, and **Voice** modules will communicate when fully integrated.

---

## 🌐 Communication Flow

```text
1. User speaks / types into UI
             ↓
2. UI calls Backend API (HTTP POST / SSE Stream)
             ↓
3. Backend verifies session & loads user financial profile
             ↓
4. Backend orchestrates RAG (for intelligence) & Voice (for STT/TTS)
             ↓
5. Backend streams formatted response back to UI
```

---

## 📡 Target API Endpoints

### 1. Health Check
- **`GET /health`**
- Returns status of the backend and connected subsystems.

### 2. AI Financial Chat
- **`POST /api/v1/chat`**
  - **Payload**: Conforms to `shared/schemas/chat_request.json`
  - **Response**: Conforms to `shared/schemas/chat_response.json`
- **`POST /api/v1/chat/stream`**
  - Returns Server-Sent Events (`text/event-stream`) streaming text chunks.

### 3. Voice Processing
- **`POST /api/v1/voice`**
  - **Payload**: Conforms to `shared/schemas/voice_request.json`
  - **Response**: Conforms to `shared/schemas/voice_response.json`
- **`POST /api/v1/voice/stream`**
  - Streams raw or encoded audio chunks for low-latency playback.

---

## 🤝 Step-by-Step Teammate Integration Guide

### For Voice Engineer:
1. Build your STT/TTS implementation in `voice/`.
2. Provide a callable service or FastAPI router that accepts audio base64 or bytes and returns transcribed text & synthesized audio.
3. Inform the Backend Engineer to mount or call your endpoints from `backend/app/main.py`.

### For RAG Engineer:
1. Build your vector retriever, prompts, and LLM reasoning chain in `rag/`.
2. Expose an inference function or router that accepts user query + financial context and returns structured answers or streaming tokens.
3. Inform the Backend Engineer to connect your engine to `/api/v1/chat`.
