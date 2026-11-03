import os
import pytest

from app.core.config import get_settings
from app.services.llm_service import LLMService


@pytest.mark.asyncio
async def test_live_gemini_api_integration():
    """LIVE GEMINI INTEGRATION TEST
    Executes a real call against Google's Gemini Developer API ONLY when a valid
    GEMINI_API_KEY is configured. Skipped automatically in CI or when unconfigured
    to avoid consuming unnecessary API quota or failing on missing credentials.
    """
    settings = get_settings()
    api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")

    if not api_key or api_key.startswith("test") or "placeholder" in api_key.lower():
        pytest.skip("Valid GEMINI_API_KEY not configured in environment or .env; skipping live API test.")

    service = LLMService()
    answer, additional = await service.answer(
        question="In one sentence, explain what polymorphism is in object-oriented programming.",
        context="OOP Concepts: Polymorphism allows objects of different classes to respond to the same method invocation.",
        history="",
        mode="Syllabus + AI",
        detail="concise",
    )

    assert len(answer) > 10
    assert "polymorphism" in answer.lower() or "method" in answer.lower()

