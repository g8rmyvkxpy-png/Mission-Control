from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    # App
    APP_NAME: str = "BharatIntel API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False
    API_PREFIX: str = "/v1"

    # CORS — allow the Vite frontend
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./bharatintel.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 3600         # 1 hour default
    CACHE_TTL_REG_SECONDS: int = 1800     # 30 min for regulatory items

    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    API_KEY_PREFIX: str = "bi_live_pk_IN_"

    # Rate limits (calls per month by plan)
    RATE_LIMIT_STARTER: int = 2000
    RATE_LIMIT_BUILDER: int = 25000
    RATE_LIMIT_GROWTH: int = 100000

    # LLM (AI Summary)
    ANTHROPIC_API_KEY: str = ""
    LLM_MODEL: str = "claude-haiku-4-5-20251001"
    LLM_MAX_TOKENS: int = 300
    LLM_SUMMARY_ENABLED: bool = True

    # External APIs
    TAVILY_API_KEY: str = ""
    SERPER_API_KEY: str = ""
    MCA_API_BASE: str = "https://www.mca.gov.in"
    RBI_RSS_CIRCULARS: str = "https://www.rbi.org.in/Scripts/RSS.aspx?Id=1"
    RBI_RSS_PRESS: str = "https://www.rbi.org.in/Scripts/RSS.aspx?Id=2"
    SEBI_RSS_URL: str = "https://www.sebi.gov.in/sebirss.xml"
    INDIAN_KANOON_BASE: str = "https://api.indiankanoon.org"
    INDIAN_KANOON_API_KEY: str = ""

    # Sentry
    SENTRY_DSN: str = ""


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
