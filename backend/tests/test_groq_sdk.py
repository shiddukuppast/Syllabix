import pytest
from app.services.llm_service import LLMConfigurationError, LLMService


def test_sdk_installation():
    """TEST 1: SDK INSTALLATION - Verify groq is installed and importable."""
    import groq
    from groq import AsyncGroq, GroqError

    assert groq is not None
    assert AsyncGroq is not None
    assert GroqError is not None


def test_client_initialization_with_api_key(monkeypatch):
    """TEST 2: CLIENT INITIALIZATION - Verify Groq client initializes using environment configuration."""
    from groq import AsyncGroq

    monkeypatch.setenv("GROQ_API_KEY", "gsk_test_api_key_12345")
    monkeypatch.setenv("GROQ_MODEL", "openai/gpt-oss-120b")

    from app.core import config

    config.get_settings.cache_clear()
    service = LLMService()

    assert service.client is not None
    assert isinstance(service.client, AsyncGroq)
    assert service.model == "openai/gpt-oss-120b"
    assert service.temperature == 0.2
    assert service.max_completion_tokens == 4096


@pytest.mark.asyncio
async def test_client_initialization_without_api_key(monkeypatch):
    """TEST 2 (Error state): Verify service detects missing API key and raises configuration error on call."""
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    from app.core import config

    config.get_settings.cache_clear()
    monkeypatch.setattr(
        "app.services.llm_service.get_settings",
        lambda: config.Settings(groq_api_key=None),
    )
    service = LLMService()

    assert service.client is None

    with pytest.raises(LLMConfigurationError) as exc_info:
        await service.answer(
            question="What is recursion?",
            context="CS101",
            history="",
            mode="Syllabus + AI",
            detail="balanced",
        )

    assert "GROQ_API_KEY is not configured" in str(exc_info.value)

