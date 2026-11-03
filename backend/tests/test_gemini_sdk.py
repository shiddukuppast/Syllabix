import pytest
from app.services.llm_service import LLMConfigurationError, LLMService


def test_sdk_installation():
    """TEST 1: SDK INSTALLATION - Verify google-genai is installed and importable."""
    from google import genai
    from google.genai import errors, types

    assert genai is not None
    assert types is not None
    assert errors is not None
    assert hasattr(genai, "Client")
    assert hasattr(types, "GenerateContentConfig")


def test_client_initialization_with_api_key(monkeypatch):
    """TEST 2: CLIENT INITIALIZATION - Verify Gemini client initializes using environment configuration."""
    from google import genai

    monkeypatch.setenv("GEMINI_API_KEY", "test-api-key-12345")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-3.8-flash")

    from app.core import config

    config.get_settings.cache_clear()
    service = LLMService()

    assert service.client is not None
    assert isinstance(service.client, genai.Client)
    assert service.model == "gemini-3.8-flash"
    assert service.temperature == 0.2
    assert service.max_output_tokens == 4096


@pytest.mark.asyncio
async def test_client_initialization_without_api_key(monkeypatch):
    """TEST 2 (Error state): Verify service detects missing API key and raises configuration error on call."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    from app.core import config

    config.get_settings.cache_clear()
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

    assert "GEMINI_API_KEY is not configured" in str(exc_info.value)
