import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.endpoints.rag import router as rag_router
from backend.app.api.voice import router as voice_router
from backend.app.services import voice_service

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI Lifespan handler for pre-warming voice models."""
    logger.info("Initializing DhanMITR Voice models (STT & TTS pre-warming)...")
    await voice_service.warmup_voice_models()
    yield
    logger.info("DhanMITR Backend shutdown complete.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend orchestration layer for DhanMITR Personal Finance Assistant",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# RAG Retrieval API
# ---------------------------------------------------------------------------
app.include_router(
    rag_router,
    prefix=settings.API_V1_PREFIX + "/rag",
    tags=["RAG"],
)

# ---------------------------------------------------------------------------
# Voice Processing API
# ---------------------------------------------------------------------------
app.include_router(
    voice_router,
    prefix=settings.API_V1_PREFIX + "/voice",
    tags=["Voice"],
)



@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "dhanmitr-backend",
        "version": settings.VERSION,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root entry point."""
    return {
        "message": "Welcome to DhanMITR API",
        "docs": "/docs",
        "health": "/health",
    }
