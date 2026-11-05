import io
import uuid
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from qdrant_client import models

from app.core.config import get_settings
from app.routes import documents
from app.services.rag_service import RAGService
from app.services.text_chunker import Chunk


@pytest.fixture
def mock_db():
    db = MagicMock()
    db.documents.insert_one = AsyncMock()
    db.documents.update_one = AsyncMock()
    db.documents.find_one = AsyncMock(return_value=None)
    db.documents.delete_one = AsyncMock()
    # Support async iteration over cursor for list_documents
    class AsyncCursor:
        def __init__(self, items):
            self.items = items
        def sort(self, *args, **kwargs):
            return self
        def __aiter__(self):
            self._iter = iter(self.items)
            return self
        async def __anext__(self):
            try:
                return next(self._iter)
            except StopIteration:
                raise StopAsyncIteration

    db.documents.find.return_value = AsyncCursor([])
    return db


@pytest.fixture
def mock_rag():
    rag = MagicMock(spec=RAGService)
    rag.embeddings = MagicMock()
    rag.embeddings.encode.return_value = [[0.1] * 384]
    rag.index = AsyncMock()
    rag.delete_document = AsyncMock()
    return rag


@pytest.fixture
def client(mock_db, mock_rag, monkeypatch, tmp_path):
    settings = get_settings()
    monkeypatch.setattr(settings, "upload_directory", tmp_path / "uploads")
    monkeypatch.setattr(settings, "max_upload_size_mb", 5)
    monkeypatch.setattr("app.routes.documents.get_database", lambda: mock_db)

    documents.set_rag_service(mock_rag)

    app = FastAPI()
    app.include_router(documents.router)
    return TestClient(app)


def test_upload_missing_file_parameter(client):
    """Multipart POST without 'file' field must return 422 Unprocessable Entity."""
    response = client.post("/api/documents/upload", files={})
    assert response.status_code == 422


def test_upload_empty_file_returns_400(client):
    """Uploading a 0-byte file must return 400 Bad Request."""
    response = client.post(
        "/api/documents/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_upload_oversized_file_returns_413(client, monkeypatch):
    """Uploading a file exceeding max_upload_size_mb must return 413 Request Entity Too Large."""
    settings = get_settings()
    monkeypatch.setattr(settings, "max_upload_size_mb", 1)  # 1 MB limit
    large_data = b"X" * (1 * 1024 * 1024 + 10)  # slightly over 1 MB

    response = client.post(
        "/api/documents/upload",
        files={"file": ("large.pdf", large_data, "application/pdf")},
    )
    assert response.status_code == 413
    assert "exceeds" in response.json()["detail"].lower()


def test_upload_unsupported_file_extension_returns_415(client):
    """Uploading files other than PDF, DOCX, or PPTX must return 415 Unsupported Media Type."""
    response = client.post(
        "/api/documents/upload",
        files={"file": ("syllabus.txt", b"Some text content", "text/plain")},
    )
    assert response.status_code == 415
    assert "unsupported" in response.json()["detail"].lower()


def test_upload_invalid_mime_type_returns_415(client):
    """Uploading a file with mismatched/invalid MIME type must return 415."""
    response = client.post(
        "/api/documents/upload",
        files={"file": ("syllabus.pdf", b"Some dummy pdf content", "image/png")},
    )
    assert response.status_code == 415
    assert "mime type" in response.json()["detail"].lower()


def test_upload_service_unavailable_when_rag_uninitialized(client):
    """If RAG service is None, upload must return 503 Service Unavailable."""
    documents._rag = None
    response = client.post(
        "/api/documents/upload",
        files={"file": ("syllabus.pdf", b"%PDF-1.4 sample content", "application/pdf")},
    )
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"].lower()


@patch("app.routes.documents.extract_document")
def test_upload_valid_pdf_success(mock_extract, client, mock_rag, mock_db):
    """Uploading a valid PDF must succeed with 201 Created and invoke RAG index with valid UUIDs."""
    mock_extract.return_value = (
        [{"text": "Syllabus Module 1: Distributed Systems", "page_number": 1, "slide_number": None, "section_heading": "Module 1"}],
        1,
    )

    pdf_bytes = b"%PDF-1.4 Mock binary stream with text"
    response = client.post(
        "/api/documents/upload",
        files={"file": ("CS101_Syllabus.pdf", pdf_bytes, "application/pdf")},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "CS101_Syllabus.pdf"
    assert data["type"] == "pdf"
    assert data["status"] == "ready"
    saved_path = Path(data["file_path"])
    assert saved_path.is_absolute()
    assert saved_path.exists()
    assert saved_path.read_bytes() == pdf_bytes
    assert "id" in data
    assert mock_rag.index.await_count == 1

    # Verify RAG index call arguments
    call_args = mock_rag.index.call_args[0]
    document_id = call_args[0]
    filename = call_args[1]
    chunks = call_args[2]
    vectors = call_args[3]

    assert filename == "CS101_Syllabus.pdf"
    assert len(chunks) >= 1
    assert len(vectors) >= 1
    assert mock_db.documents.insert_one.await_count == 1


@patch("app.routes.documents.extract_document")
def test_upload_valid_docx_success(mock_extract, client, mock_rag):
    """Uploading a valid DOCX file must succeed with 201 Created."""
    mock_extract.return_value = (
        [{"text": "Database Management Systems Course Outline", "page_number": None, "slide_number": None, "section_heading": "DBMS"}],
        1,
    )

    docx_bytes = b"PK\x03\x04 Mock DOCX zip structure content"
    response = client.post(
        "/api/documents/upload",
        files={
            "file": (
                "DBMS_Curriculum.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "DBMS_Curriculum.docx"
    assert data["type"] == "docx"
    assert data["status"] == "ready"
    saved_path = Path(data["file_path"])
    assert saved_path.exists()
    assert saved_path.read_bytes() == docx_bytes


@patch("app.routes.documents.extract_document")
def test_upload_valid_pptx_success(mock_extract, client, mock_rag):
    """Uploading a valid PPTX file must succeed with 201 Created."""
    mock_extract.return_value = (
        [{"text": "Lecture 1: Intro to AI", "page_number": None, "slide_number": 1, "section_heading": None}],
        1,
    )

    pptx_bytes = b"PK\x03\x04 Mock PPTX zip structure content"
    response = client.post(
        "/api/documents/upload",
        files={
            "file": (
                "Lecture1.pptx",
                pptx_bytes,
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            )
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Lecture1.pptx"
    assert data["type"] == "pptx"
    assert data["status"] == "ready"


@patch("app.routes.documents.extract_document")
def test_upload_unparseable_document_returns_422(mock_extract, client, mock_db):
    """If document yields 0 text blocks, return 422 Unprocessable Entity."""
    mock_extract.return_value = ([], 0)

    pdf_bytes = b"%PDF-1.4 Empty text content"
    response = client.post(
        "/api/documents/upload",
        files={"file": ("scanned_blank.pdf", pdf_bytes, "application/pdf")},
    )

    assert response.status_code == 422
    assert "no readable text" in response.json()["detail"].lower()


@patch("app.routes.documents.extract_document")
def test_upload_rollback_on_index_failure(mock_extract, client, mock_rag, mock_db):
    """If RAG indexing fails, metadata is marked failed and the file is retained."""
    mock_extract.return_value = (
        [{"text": "Valid syllabus text", "page_number": 1, "slide_number": None, "section_heading": None}],
        1,
    )
    mock_rag.index.side_effect = RuntimeError("Qdrant connection dropped during upsert")

    pdf_bytes = b"%PDF-1.4 Mock content"
    response = client.post(
        "/api/documents/upload",
        files={"file": ("error_doc.pdf", pdf_bytes, "application/pdf")},
    )

    assert response.status_code == 422
    assert "Document processing failed" in response.json()["detail"]
    update_calls = mock_db.documents.update_one.await_args_list
    assert any(call.args[1]["$set"]["processing_status"] == "failed" for call in update_calls)
    saved_record = mock_db.documents.insert_one.await_args.args[0]
    assert Path(saved_record["file_path"]).exists()


@pytest.mark.asyncio
async def test_qdrant_point_id_is_valid_uuid():
    """Verify that RAGService.index generates valid UUIDs for Qdrant PointStruct."""
    mock_embeddings = MagicMock()
    mock_llm = MagicMock()
    rag = RAGService(mock_embeddings, mock_llm)

    chunks = [
        Chunk(text="First chunk content", page_number=1, slide_number=None, section_heading="Intro", index=0),
        Chunk(text="Second chunk content", page_number=2, slide_number=None, section_heading="Methods", index=1),
    ]
    vectors = [[0.1] * 384, [0.2] * 384]

    mock_qdrant = MagicMock()
    mock_qdrant.delete = AsyncMock()
    mock_qdrant.upsert = AsyncMock()

    with patch("app.services.rag_service.get_qdrant", return_value=mock_qdrant):
        await rag.index("doc_test_123", "test.pdf", chunks, vectors)

    assert mock_qdrant.upsert.await_count == 1
    assert mock_qdrant.delete.await_count == 1
    call_kwargs = mock_qdrant.upsert.call_args[1]
    points = call_kwargs["points"]
    assert len(points) == 2

    for index, point in enumerate(points):
        assert isinstance(point, models.PointStruct)
        # This will raise ValueError if point.id is not a valid UUID string
        parsed_uuid = uuid.UUID(point.id)
        assert str(parsed_uuid) == point.id
        assert point.payload["document_id"] == "doc_test_123"
        assert point.payload["chunk_id"] == chunks[index].chunk_id
