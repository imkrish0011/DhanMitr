"""Core configuration settings for DhanMITR Backend."""
from pathlib import Path
from typing import Any, List

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
    ALLOWED_ORIGINS: Any = [
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
        default="llama-3.1-8b-instant", validation_alias="GROQ_MODEL"
    )
    COINGECKO_API_KEY: str = Field(
        default="", validation_alias="COINGECKO_API_KEY"
    )
    TAVILY_API_KEY: str = Field(
        default="", validation_alias="TAVILY_API_KEY"
    )
    METALS_DEV_API_KEY: str = Field(
        default="", validation_alias="METALS_DEV_API_KEY"
    )
    TWELVE_DATA_API_KEY: str = Field(
        default="", validation_alias="TWELVE_DATA_API_KEY"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v):
        """Allow comma-separated origins, JSON arrays, or strings in env vars."""
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, (list, tuple)):
            return list(v)
        return ["*"]


settings = Settings()
