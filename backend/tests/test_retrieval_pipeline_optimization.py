from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
import pytest

from app.services.document_processor import extract_document
from app.services.text_chunker import chunk_blocks
from app.services.rag_service import RAGService


def test_pdf_extraction_strips_headers_footers_and_stitches_pages():
    """Verify that document_processor:
    1. Strips repetitive running headers ('COMPUTER NETWORKS') and footers ('SCHOOL OF C&IT, REVA UNIVERSITY 3').
    2. Detects section headings ('1.2 Data Communication', 'Components of Data Communication').
    3. Stitches sentences split across page boundaries without header interruption.
    """
    fixture_path = Path(__file__).parent / "fixtures" / "CN-UNIT1_Notes.pdf"
    assert fixture_path.exists(), "Test fixture CN-UNIT1_Notes.pdf must exist"

    blocks, total_pages = extract_document(fixture_path, "pdf")

    assert total_pages == 4
    assert len(blocks) >= 3

    # Ensure no running headers or footers in any block text
    for b in blocks:
        assert "COMPUTER NETWORKS" not in b["text"]
        assert "SCHOOL OF C&IT" not in b["text"]

    # Locate the 1.2 Data Communication block
    dc_blocks = [b for b in blocks if b.get("section_heading") == "1.2 Data Communication"]
    assert len(dc_blocks) >= 1
    dc_text = "\n".join(b["text"] for b in dc_blocks)

    # Verify that the split sentence was stitched cleanly
    assert "Data must be received by the intended device or user" in dc_text

    # Verify all four characteristics are present
    assert "1. Delivery:" in dc_text
    assert "2. Accuracy:" in dc_text
    assert "3. Timeliness:" in dc_text
    assert "4. Jitter:" in dc_text


def test_chunking_preserves_four_characteristics_in_unified_chunk():
    """Verify that structure-aware chunking keeps the 4 fundamental characteristics
    cohesively together in a single chunk with its section heading.
    """
    fixture_path = Path(__file__).parent / "fixtures" / "CN-UNIT1_Notes.pdf"
    blocks, _ = extract_document(fixture_path, "pdf")
    chunks = chunk_blocks(blocks, size=700, overlap=120)

    # Find the chunk containing characteristics
    char_chunks = [c for c in chunks if "fundamental characteristics" in c.text.lower()]
    assert len(char_chunks) == 1
    c = char_chunks[0]

    assert c.section_heading == "1.2 Data Communication"
    assert "Delivery:" in c.text
    assert "Accuracy:" in c.text
    assert "Timeliness:" in c.text
    assert "Jitter:" in c.text


@pytest.mark.asyncio
async def test_rag_service_retrieval_and_answer_with_all_characteristics():
    """Verify that RAGService passes all 4 characteristics to LLM answer generation."""
    fixture_path = Path(__file__).parent / "fixtures" / "CN-UNIT1_Notes.pdf"
    blocks, _ = extract_document(fixture_path, "pdf")
    chunks = chunk_blocks(blocks, size=700, overlap=120)

    target_chunk = next(c for c in chunks if "fundamental characteristics" in c.text.lower())

    mock_embeddings = MagicMock()
    mock_llm = MagicMock()
    mock_llm.answer = AsyncMock(
        return_value=(
            "### Four Fundamental Characteristics of Data Communication\n\n"
            "1. **Delivery**: The system must deliver data to the correct destination.\n"
            "2. **Accuracy**: The system must deliver data accurately without errors.\n"
            "3. **Timeliness**: The system must deliver data in a timely manner (real-time).\n"
            "4. **Jitter**: Variation in packet arrival time causing uneven delay in audio/video.",
            None,
        )
    )

    rag = RAGService(embeddings=mock_embeddings, llm=mock_llm)
    rag.retrieve = AsyncMock(return_value=[
        {
            "score": 0.88,
            "filename": "CN-UNIT1_Notes.pdf",
            "location": "Page 3",
            "section_heading": "1.2 Data Communication",
            "chunk_text": target_chunk.text,
            "chunk_id": target_chunk.chunk_id,
            "document_id": "doc-test-cn-1",
        }
    ])

    answer, additional, sources = await rag.answer(
        question="Explain the fundamental characteristics of data communication.",
        history="",
        mode="Strict Syllabus",
        detail="balanced",
    )

    assert mock_llm.answer.await_count == 1
    llm_context = mock_llm.answer.call_args[0][1]

    # Verify context passed to LLM has all four characteristics
    assert "Delivery:" in llm_context
    assert "Accuracy:" in llm_context
    assert "Timeliness:" in llm_context
    assert "Jitter:" in llm_context

    # Verify generated answer
    assert "Delivery" in answer
    assert "Accuracy" in answer
    assert "Timeliness" in answer
    assert "Jitter" in answer
    assert len(sources) == 1
    assert sources[0].page == "Page 3"

