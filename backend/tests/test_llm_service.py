from unittest.mock import AsyncMock, MagicMock
from google.genai import errors, types
import httpx
import pytest

from app.services.llm_service import (
    LLMConfigurationError,
    LLMContentFilterError,
    LLMEmptyResponseError,
    LLMModelNotFoundError,
    LLMQuotaExceededError,
    LLMService,
    LLMTimeoutError,
)


def make_mock_response(text: str, finish_reason=types.FinishReason.STOP):
    return types.GenerateContentResponse(
        candidates=[
            types.Candidate(
                content=types.Content(
                    parts=[types.Part.from_text(text=text)],
                    role="model",
                ),
                finish_reason=finish_reason,
            )
        ]
    )


@pytest.mark.asyncio
async def test_basic_generation_tcp_vs_udp():
    """TEST 3: BASIC GENERATION - Send an academic question and verify Gemini response."""
    mock_client = MagicMock()
    mock_generate = AsyncMock(
        return_value=make_mock_response(
            "TCP (Transmission Control Protocol) is connection-oriented and ensures reliable, ordered packet delivery with error-checking and flow control. "
            "UDP (User Datagram Protocol) is connectionless, prioritizing speed and low latency without delivery guarantees, suitable for live streaming and gaming."
        )
    )
    mock_client.aio.models.generate_content = mock_generate

    service = LLMService(client=mock_client, model="gemini-3.8-flash")
    answer, additional = await service.answer(
        question="Explain the difference between TCP and UDP.",
        context="Computer Networks: Transport Layer protocols.",
        history="",
        mode="Syllabus + AI",
        detail="balanced",
    )

    assert "TCP" in answer and "UDP" in answer
    assert "connection-oriented" in answer
    assert additional is None
    assert mock_generate.await_count == 1

    # Verify call parameters
    call_kwargs = mock_generate.call_args.kwargs
    assert call_kwargs["model"] == "gemini-3.8-flash"
    assert "Explain the difference between TCP and UDP." in call_kwargs["contents"]
    assert "Syllabus + AI" in call_kwargs["config"].system_instruction


@pytest.mark.asyncio
async def test_strict_syllabus_mode_insufficient_context():
    """TEST 5: STRICT SYLLABUS MODE - Verify refusal when answer is not in context."""
    mock_client = MagicMock()
    mock_generate = AsyncMock(
        return_value=make_mock_response(
            "The provided syllabus materials do not contain sufficient information to answer this question. "
            "The retrieved course notes only cover Database Normalization (1NF, 2NF, 3NF), and do not mention Quantum Computing."
        )
    )
    mock_client.aio.models.generate_content = mock_generate

    service = LLMService(client=mock_client)
    answer, additional = await service.answer(
        question="What is Shor's algorithm for quantum factorisation?",
        context="Module 3: Database Normalization. First normal form eliminates duplicate columns.",
        history="",
        mode="Strict Syllabus",
        detail="balanced",
    )

    assert "sufficient information" in answer.lower() or "insufficient" in answer.lower()
    assert additional is None

    # Verify system instruction explicitly instructs strict adherence
    call_kwargs = mock_generate.call_args.kwargs
    assert "Strict Syllabus mode" in call_kwargs["config"].system_instruction
    assert "Never fabricate citations" in call_kwargs["config"].system_instruction


@pytest.mark.asyncio
async def test_syllabus_plus_ai_mode_separation():
    """TEST 6: SYLLABUS + AI MODE - Verify document context and additional AI knowledge separation."""
    mock_client = MagicMock()
    mock_generate = AsyncMock(
        return_value=make_mock_response(
            "Binary search has an average and worst-case time complexity of O(log n), requiring a sorted array.\n\n"
            "### Additional AI Knowledge\n"
            "In modern databases, B-trees and B+ trees utilize multi-way binary search concepts to minimize disk I/O operations."
        )
    )
    mock_client.aio.models.generate_content = mock_generate

    service = LLMService(client=mock_client)
    answer, additional = await service.answer(
        question="What is the time complexity of binary search?",
        context="[Algorithms Chapter 4] Binary search halves search space on each iteration: O(log n).",
        history="",
        mode="Syllabus + AI",
        detail="balanced",
    )

    assert "O(log n)" in answer
    assert "### Additional AI Knowledge" not in answer
    assert additional is not None
    assert "B-trees and B+ trees" in additional


@pytest.mark.asyncio
async def test_conversation_history_retained():
    """TEST 8: CONVERSATION HISTORY - Verify follow-up questions retain context."""
    mock_client = MagicMock()
    mock_generate = AsyncMock(return_value=make_mock_response("Merge sort is a divide-and-conquer algorithm with O(n log n) complexity."))
    mock_client.aio.models.generate_content = mock_generate

    service = LLMService(client=mock_client)
    history = "user: What is sorting?\nassistant: Sorting is arranging data in order."
    await service.answer(
        question="What about Merge Sort specifically?",
        context="[Algorithms Notes] Merge sort divide and conquer.",
        history=history,
        mode="Syllabus + AI",
        detail="balanced",
    )

    call_kwargs = mock_generate.call_args.kwargs
    prompt = call_kwargs["contents"]
    assert "RECENT CONVERSATION:\n" + history in prompt
    assert "QUESTION:\nWhat about Merge Sort specifically?" in prompt


@pytest.mark.asyncio
async def test_error_handling_invalid_api_key():
    """TEST 9: ERROR HANDLING - Invalid API key raises LLMConfigurationError."""
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(
        side_effect=errors.ClientError(400, {"error": {"message": "API key not valid. Please pass a valid API key."}})
    )

    service = LLMService(client=mock_client)
    with pytest.raises(LLMConfigurationError) as exc_info:
        await service.answer("Test", "Context", "", "Syllabus + AI", "balanced")

    assert "Invalid or unauthorized Gemini API key" in str(exc_info.value)


@pytest.mark.asyncio
async def test_error_handling_model_not_found():
    """TEST 9: ERROR HANDLING - Model not found raises LLMModelNotFoundError."""
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(
        side_effect=errors.ClientError(404, {"error": {"message": "models/non-existent-model is not found"}})
    )

    service = LLMService(client=mock_client, model="non-existent-model")
    with pytest.raises(LLMModelNotFoundError) as exc_info:
        await service.answer("Test", "Context", "", "Syllabus + AI", "balanced")

    assert "was not found" in str(exc_info.value)


@pytest.mark.asyncio
async def test_error_handling_quota_exceeded():
    """TEST 9: ERROR HANDLING - Rate limit (429) retries and raises LLMQuotaExceededError."""
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(
        side_effect=errors.ClientError(429, {"error": {"message": "Resource has been exhausted (e.g. check quota)."}})
    )

    service = LLMService(client=mock_client, max_retries=1)
    with pytest.raises(LLMQuotaExceededError) as exc_info:
        await service.answer("Test", "Context", "", "Syllabus + AI", "balanced")

    assert "rate limit or quota exceeded" in str(exc_info.value).lower()
    # Verified it retried up to max_retries
    assert mock_client.aio.models.generate_content.await_count == 2


@pytest.mark.asyncio
async def test_error_handling_timeout():
    """TEST 9: ERROR HANDLING - Request timeout raises LLMTimeoutError."""
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(
        side_effect=httpx.ReadTimeout("Request timed out")
    )

    service = LLMService(client=mock_client, timeout_seconds=10.0, max_retries=1)
    with pytest.raises(LLMTimeoutError) as exc_info:
        await service.answer("Test", "Context", "", "Syllabus + AI", "balanced")

    assert "timed out" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_error_handling_safety_blocked():
    """TEST 9: ERROR HANDLING - Safety filtered response raises LLMContentFilterError."""
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=make_mock_response("", finish_reason=types.FinishReason.SAFETY)
    )

    service = LLMService(client=mock_client)
    with pytest.raises(LLMContentFilterError) as exc_info:
        await service.answer("Dangerous question", "Context", "", "Syllabus + AI", "balanced")

    assert "safety settings" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_error_handling_empty_response():
    """TEST 9: ERROR HANDLING - Empty text response raises LLMEmptyResponseError."""
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=types.GenerateContentResponse(candidates=[])
    )

    service = LLMService(client=mock_client)
    with pytest.raises(LLMEmptyResponseError) as exc_info:
        await service.answer("Test", "Context", "", "Syllabus + AI", "balanced")

    assert "empty response" in str(exc_info.value).lower()
