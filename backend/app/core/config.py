"""Core configuration settings for DhanMITR Backend."""
from pathlib import Path
from typing import List

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Repo root: backend/app/core/config.py -> parents[3]
ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        extra="allow",
        env_file=str(ROOT_DIR / ".env"),
        env_file_encoding="utf-8",
    )

    PROJECT_NAME: str = "DhanMITR API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # Server Binding
    HOST: str = Field(default="0.0.0.0", validation_alias="BACKEND_HOST")
    PORT: int = Field(default=8000, validation_alias="BACKEND_PORT")
    DEBUG: bool = Field(default=True, validation_alias="BACKEND_DEBUG")

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # Supabase / Database
    SUPABASE_URL: str = Field(
        default="",
        validation_alias=AliasChoices("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
    )
    SUPABASE_SERVICE_KEY: str = Field(
        default="", validation_alias="SUPABASE_SERVICE_ROLE_KEY"
    )

    # LLM / Groq & Live Data
    GROQ_API_KEY: str = Field(default="", validation_alias="GROQ_API_KEY")
    GROQ_MODEL: str = Field(
        default="openai/gpt-oss-120b", validation_alias="GROQ_MODEL"
    )
    COINGECKO_API_KEY: str = Field(
        default="", validation_alias="COINGECKO_API_KEY"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v):
        """Allow comma-separated origins in env vars (in addition to JSON arrays)."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
