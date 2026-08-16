"""Core configuration settings for DhanMITR Backend."""
import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "DhanMITR API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Server Binding
    HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    DEBUG: bool = os.getenv("BACKEND_DEBUG", "true").lower() == "true"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # Supabase / Database
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    class Config:
        case_sensitive = True
        extra = "allow"


settings = Settings()
