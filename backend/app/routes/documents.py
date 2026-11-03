import mimetypes
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.database.mongodb import get_database
from app.services.document_processor import extract_document
from app.services.rag_service import RAGService
from app.services.text_chunker import chunk_blocks

router = APIRouter(prefix="/api/documents", tags=["documents"])
_rag: RAGService | None = None
ALLOWED = {"pdf": "application/pdf", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"}


def set_rag_service(rag: RAGService) -> None:
    global _rag
    _rag = rag


def _response(doc: dict) -> dict:
    return {"id": doc["document_id"], "name": doc["original_filename"], "size": f'{doc["file_size"] / 1024:.0f} KB', "pages": str(doc.get("total_pages_or_slides", "Document")), "status": doc["processing_status"], "type": doc["file_type"]}


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...)) -> dict:
    settings = get_settings()
    extension = Path(file.filename or "").suffix.lower().lstrip(".")
    if extension not in ALLOWED or (file.content_type and file.content_type != ALLOWED[extension]):
        raise HTTPException(415, "Only valid PDF, DOCX, and PPTX files are supported")
    data = await file.read()
    if not data or len(data) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(413, "File is empty or exceeds the configured size limit")
    document_id = uuid.uuid4().hex
    directory = settings.upload_directory / document_id
    directory.mkdir(parents=True, exist_ok=False)
    path = directory / f"original.{extension}"
    path.write_bytes(data)
    db = get_database()
    record = {"document_id": document_id, "filename": path.name, "original_filename": Path(file.filename or "document").name, "file_type": extension, "file_size": len(data), "created_at": datetime.now(timezone.utc), "processing_status": "processing"}
    indexed = False
    try:
        blocks, total = extract_document(path, extension)
        chunks = chunk_blocks(blocks, settings.chunk_size_tokens, settings.chunk_overlap_tokens)
        if _rag is None:
            raise RuntimeError("RAG service is not initialized")
        rag = _rag
        vectors = rag.embeddings.encode([chunk.text for chunk in chunks])
        await rag.index(document_id, record["original_filename"], chunks, vectors)
        indexed = True
        record.update({"processing_status": "ready", "total_pages_or_slides": total, "total_chunks": len(chunks)})
        await db.documents.insert_one(record)
        return _response(record)
    except Exception as exc:
        if indexed:
            await rag.delete_document(document_id)
        await db.documents.delete_one({"document_id": document_id})
        path.unlink(missing_ok=True)
        directory.rmdir()
        raise HTTPException(422, f"Document processing failed: {exc}") from exc


@router.get("")
async def list_documents() -> list[dict]:
    return [_response(doc) async for doc in get_database().documents.find().sort("created_at", -1)]


@router.get("/{document_id}")
async def get_document(document_id: str) -> dict:
    doc = await get_database().documents.find_one({"document_id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found")
    return _response(doc)


@router.delete("/{document_id}")
async def delete_document(document_id: str) -> dict:
    db = get_database()
    doc = await db.documents.find_one({"document_id": document_id})
    if not doc:
        raise HTTPException(404, "Document not found")
    if _rag is None:
        raise HTTPException(503, "RAG service is not initialized")
    rag = _rag
    await rag.delete_document(document_id)
    path = get_settings().upload_directory / document_id / doc["filename"]
    path.unlink(missing_ok=True)
    directory = path.parent
    if directory.exists():
        directory.rmdir()
    await db.documents.delete_one({"document_id": document_id})
    return {"deleted": True}
