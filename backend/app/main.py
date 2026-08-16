"""FastAPI Application for DhanMITR Backend Orchestrator."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend orchestration layer for DhanMITR Personal Finance Assistant",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
