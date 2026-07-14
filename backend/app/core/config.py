"""Centralized application configuration.

All configuration is sourced from environment variables (see .env.example).
Never hardcode secrets, credentials, or environment-specific values here.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded once and cached for the process lifetime."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    APP_NAME: str = "ElectricQuote AI API"
    ENVIRONMENT: Literal["local", "test", "staging", "production"] = "local"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"

    # --- Server ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # --- CORS ---
    CORS_ALLOWED_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    # --- Database ---
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://electricquote:electricquote@localhost:5432/electricquote"
    )
    DATABASE_URL_SYNC: str = Field(
        default="postgresql+psycopg2://electricquote:electricquote@localhost:5432/electricquote"
    )
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Auth / JWT ---
    JWT_SECRET_KEY: str = Field(default="CHANGE_ME_IN_PRODUCTION")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    PASSWORD_HASH_PEPPER: str = Field(default="CHANGE_ME_IN_PRODUCTION")

    # --- Rate limiting ---
    RATE_LIMIT_DEFAULT_PER_MINUTE: int = 60
    RATE_LIMIT_AUTH_PER_MINUTE: int = 10
    RATE_LIMIT_AI_PER_MINUTE: int = 10

    # --- Object storage (S3-compatible) ---
    STORAGE_ENDPOINT_URL: str | None = None
    STORAGE_BUCKET_NAME: str = "electricquote-assets"
    STORAGE_ACCESS_KEY_ID: str = ""
    STORAGE_SECRET_ACCESS_KEY: str = ""
    STORAGE_REGION: str = "us-east-1"
    STORAGE_PUBLIC_BASE_URL: str | None = None

    # --- Anthropic Claude API ---
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-6"

    # --- Email (transactional) ---
    EMAIL_PROVIDER_API_KEY: str = ""
    EMAIL_FROM_ADDRESS: str = "quotes@electricquote.ai"

    # --- SMS / OTP ---
    SMS_PROVIDER_API_KEY: str = ""
    SMS_PROVIDER_FROM_NUMBER: str = ""

    # --- Frontend ---
    FRONTEND_BASE_URL: str = "http://localhost:5173"

    @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (loaded once per process)."""
    return Settings()


# Convenience module-level accessor used across the app.
settings = get_settings()

# Referenced for type-checking only; not evaluated at import time.
_ = PostgresDsn
