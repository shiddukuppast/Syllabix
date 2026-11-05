from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.schemas.chat import SourceReference
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService


@pytest.mark.asyncio
async def test_rag_integration_and_clean_source_references():
    """TEST: RAG INTEGRATION & SOURCE REFERENCES
    Verifies that retrieved chunks are passed cleanly to LLM and source references
    (doc names, page/slide locations, snippets, scores) are properly populated.
    """
    mock_embeddings = MagicMock()
    mock_llm = MagicMock(spec=LLMService)
    mock_llm.answer = AsyncMock(
        return_value=(
            "Deadlock prevention requires eliminating one of the four Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, or Circular Wait.\n\nSource: Operating_Systems_Silberschatz.pdf, Page 312",
            "Banker's Algorithm is an example of deadlock avoidance rather than strict prevention.",
        )
    )

    rag = RAGService(embeddings=mock_embeddings, llm=mock_llm)

    # Mock retrieval results
    retrieved_items = [
        {
            "score": 0.884,
            "filename": "Operating_Systems_Silberschatz.pdf",
            "location": "Page 312",
            "chunk_text": "Chapter 7: Deadlocks. Four necessary Coffman conditions: Mutual exclusion, hold and wait, no preemption, circular wait.",
            "chunk_id": "chunk-deadlock-1",
            "document_id": "doc-os-1",
        },
        {
            "score": 0.762,
            "filename": "OS_Lecture_Slides.pptx",
            "location": "Slide 18",
            "chunk_text": "Deadlock handling strategies include prevention, avoidance, and detection/recovery.",
            "chunk_id": "chunk-deadlock-2",
            "document_id": "doc-os-2",
        },
    ]
    rag.retrieve = AsyncMock(return_value=retrieved_items)

    answer, additional, sources = await rag.answer(
        question="What are the conditions required for a deadlock to occur?",
        history="",
        mode="Syllabus + AI",
        detail="balanced",
    )

    # Verify LLM was called with clean retrieved context without exposing chunk_id in context string
    assert mock_llm.answer.await_count == 1
    llm_call_args = mock_llm.answer.call_args[0]
    passed_question = llm_call_args[0]
    passed_context = llm_call_args[1]

    assert passed_question == "What are the conditions required for a deadlock to occur?"
    assert "Source: Operating_Systems_Silberschatz.pdf, Page 312" in passed_context
    assert "Source: OS_Lecture_Slides.pptx, Slide 18" in passed_context
    assert "chunk_id=" not in passed_context

    # Verify answers
    assert "Coffman conditions" in answer
    assert "Banker's Algorithm" in additional

    # Verify Source References for frontend
    assert len(sources) == 2
    assert isinstance(sources[0], SourceReference)
    assert sources[0].doc_name == "Operating_Systems_Silberschatz.pdf"
    assert sources[0].page == "Page 312"
    assert "Chapter 7: Deadlocks" in sources[0].snippet
    assert sources[0].match_score == 88
    assert sources[0].chunk_id == "chunk-deadlock-1"
    assert sources[0].document_id == "doc-os-1"

    assert sources[1].doc_name == "OS_Lecture_Slides.pptx"
    assert sources[1].page == "Slide 18"
    assert sources[1].match_score == 76
    assert sources[1].chunk_id == "chunk-deadlock-2"


@pytest.mark.asyncio
async def test_retrieval_filters_by_document_id():
    embeddings = MagicMock()
    embeddings.encode.return_value = [[0.1] * 384]
    rag = RAGService(embeddings=embeddings, llm=MagicMock())
    qdrant = MagicMock()
    qdrant.query_points = AsyncMock(return_value=SimpleNamespace(points=[]))

    with patch("app.services.rag_service.get_qdrant", return_value=qdrant):
        results = await rag.retrieve("deadlocks", ["document-1", "document-2"])

    assert results == []
    query_filter = qdrant.query_points.call_args.kwargs["query_filter"]
    assert len(query_filter.should) == 2
    assert {condition.match.value for condition in query_filter.should} == {"document-1", "document-2"}

