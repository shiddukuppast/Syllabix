from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "syllabix"
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str | None = None
    qdrant_timeout_seconds: float = 30.0
    qdrant_batch_size: int = 64
    qdrant_max_retries: int = 3
    groq_api_key: str | None = None
    groq_model: str = "openai/gpt-oss-120b"
    groq_temperature: float = 0.2
    groq_max_completion_tokens: int = 4096
    groq_timeout_seconds: float = 45.0
    groq_max_retries: int = 2
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    frontend_url: str = "http://localhost:3000"
    upload_directory: Path = Path("./uploads")
    max_upload_size_mb: int = 25
    chunk_size_tokens: int = 700
    chunk_overlap_tokens: int = 120
    retrieval_limit: int = 5
    retrieval_score_threshold: float = 0.25

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if not settings.upload_directory.is_absolute():
        settings.upload_directory = BACKEND_DIRECTORY / settings.upload_directory
    settings.upload_directory = settings.upload_directory.resolve()
    settings.upload_directory.mkdir(parents=True, exist_ok=True)
    return settings
