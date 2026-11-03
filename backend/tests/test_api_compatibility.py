from unittest.mock import AsyncMock, MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from app.routes import chat
from app.schemas.chat import SourceReference
from app.services.llm_service import (
    LLMConfigurationError,
    LLMContentFilterError,
    LLMQuotaExceededError,
    LLMTimeoutError,
)
from app.services.rag_service import RAGService


@pytest.fixture
def test_client(monkeypatch):
    """Create an isolated test client for chat route without triggering DB lifespan."""
    mock_db = MagicMock()
    mock_db.conversations.find_one = AsyncMock(return_value=None)
    mock_db.conversations.replace_one = AsyncMock()

    monkeypatch.setattr("app.routes.chat.get_database", lambda: mock_db)

    app = FastAPI()
    app.include_router(chat.router)
    return TestClient(app)


def test_api_chat_frontend_schema_contract(test_client):
    """TEST 10: FRONTEND INTEGRATION - Verify POST /api/chat adheres strictly to frontend schema."""
    mock_rag = MagicMock(spec=RAGService)
    mock_rag.answer = AsyncMock(
        return_value=(
            "QuickSort selects a pivot element and partitions the array.",
            "Average time complexity is O(n log n), worst case is O(n^2).",
            [
                SourceReference(
                    doc_name="Algorithms_CLRS.pdf",
                    page="Page 171",
                    snippet="Section 7.1 Description of quicksort...",
                    match_score=92,
                )
            ],
        )
    )
    chat.set_rag_service(mock_rag)

    response = test_client.post(
        "/api/chat",
        json={
            "question": "How does QuickSort work?",
            "conversation_id": None,
            "mode": "Syllabus + AI",
            "detail": "balanced",
        },
    )

    assert response.status_code == 200
    data = response.json()

    # Verify keys expected by frontend/lib/api.ts
    assert "conversation_id" in data and isinstance(data["conversation_id"], str)
    assert "message_id" in data and isinstance(data["message_id"], str)
    assert "answer" in data and "QuickSort selects a pivot" in data["answer"]
    assert "additional_ai_knowledge" in data
    assert "O(n log n)" in data["additional_ai_knowledge"]
    assert "sources" in data and isinstance(data["sources"], list)
    assert len(data["sources"]) == 1

    source = data["sources"][0]
    assert source["doc_name"] == "Algorithms_CLRS.pdf"
    assert source["page"] == "Page 171"
    assert "quicksort" in source["snippet"].lower()
    assert source["match_score"] == 92


def test_api_chat_missing_credentials_error(test_client):
    """TEST 10: Verify frontend receives clean HTTP 503 on unconfigured Gemini key."""
    mock_rag = MagicMock(spec=RAGService)
    mock_rag.answer = AsyncMock(
        side_effect=LLMConfigurationError("GEMINI_API_KEY is not configured.")
    )
    chat.set_rag_service(mock_rag)

    response = test_client.post(
        "/api/chat",
        json={"question": "Test question", "mode": "Strict Syllabus", "detail": "balanced"},
    )

    assert response.status_code == 503
    assert "GEMINI_API_KEY is not configured" in response.json()["detail"]


def test_api_chat_quota_exceeded_error(test_client):
    """TEST 10: Verify frontend receives clean HTTP 429 on Gemini quota exhaustion."""
    mock_rag = MagicMock(spec=RAGService)
    mock_rag.answer = AsyncMock(
        side_effect=LLMQuotaExceededError("Gemini API rate limit or quota exceeded.")
    )
    chat.set_rag_service(mock_rag)

    response = test_client.post(
        "/api/chat",
        json={"question": "Test question", "mode": "Syllabus + AI", "detail": "balanced"},
    )

    assert response.status_code == 429
    assert "rate limit or quota exceeded" in response.json()["detail"].lower()


def test_api_chat_timeout_error(test_client):
    """TEST 10: Verify frontend receives clean HTTP 504 on Gemini timeout."""
    mock_rag = MagicMock(spec=RAGService)
    mock_rag.answer = AsyncMock(
        side_effect=LLMTimeoutError("Gemini API request timed out after 45s.")
    )
    chat.set_rag_service(mock_rag)

    response = test_client.post(
        "/api/chat",
        json={"question": "Test question", "mode": "Syllabus + AI", "detail": "balanced"},
    )

    assert response.status_code == 504
    assert "timed out" in response.json()["detail"].lower()
