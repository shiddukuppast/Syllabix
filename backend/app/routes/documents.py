import asyncio
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.database.mongodb import get_database
from app.services.document_processor import extract_document
from app.services.rag_service import RAGService
from app.services.text_chunker import chunk_blocks

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])
_rag: RAGService | None = None

ALLOWED_EXTENSIONS = {"pdf", "docx", "pptx"}

ALLOWED_MIME_TYPES = {
    "pdf": {
        "application/pdf",
        "application/x-pdf",
        "application/acrobat",
        "applications/vnd.pdf",
        "text/pdf",
        "application/octet-stream",
    },
    "docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream",
    },
    "pptx": {
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream",
    },
}


def set_rag_service(rag: RAGService) -> None:
    global _rag
    _rag = rag


def _response(doc: dict) -> dict:
    processing_status = doc.get("processing_status", "failed")
    return {
        "id": doc["document_id"],
        "name": doc["original_filename"],
        "file_path": doc.get("file_path", ""),
        "size": f'{doc["file_size"] / 1024:.0f} KB',
        "pages": str(doc.get("total_pages_or_slides", "Document")),
        "status": "ready" if processing_status == "completed" else processing_status,
        "processing_status": processing_status,
        "error": doc.get("processing_error"),
        "chunks": doc.get("total_chunks", 0),
        "type": doc["file_type"],
    }


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...)) -> dict:
    settings = get_settings()
    raw_filename = file.filename or ""
    extension = Path(raw_filename).suffix.lower().lstrip(".")

    if not extension or extension not in ALLOWED_EXTENSIONS:
        logger.warning("Rejected upload due to invalid extension: %s", raw_filename)
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file format '.{extension}'. Only PDF, DOCX, and PPTX files are supported.",
        )

    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type and content_type not in ALLOWED_MIME_TYPES.get(extension, set()):
        logger.warning(
            "Rejected upload due to invalid MIME type: filename=%s, content_type=%s, extension=%s",
            raw_filename,
            file.content_type,
            extension,
        )
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"MIME type '{file.content_type}' is not valid for .{extension} files.",
        )

    data = await file.read()
    if not data or len(data) == 0:
        logger.warning("Rejected empty file upload: %s", raw_filename)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes).",
        )

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(data) > max_bytes:
        logger.warning("Rejected oversized file upload: %s (%d bytes)", raw_filename, len(data))
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the configured limit of {settings.max_upload_size_mb} MB.",
        )

    if _rag is None:
        logger.error("RAG service requested but not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG indexing service is temporarily unavailable.",
        )
    rag = _rag

    document_id = uuid.uuid4().hex
    directory = settings.upload_directory / document_id
    directory.mkdir(parents=True, exist_ok=False)
    path = directory / f"original.{extension}"
    path.write_bytes(data)
    path = path.resolve()
    if not path.exists() or path.stat().st_size != len(data):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The uploaded file could not be saved.",
        )
    logger.info("Saved uploaded file: %s", path)

    db = get_database()
    safe_name = Path(raw_filename or "document").name
    record = {
        "document_id": document_id,
        "filename": path.name,
        "original_filename": safe_name,
        "file_path": str(path),
        "file_type": extension,
        "file_size": len(data),
        "created_at": datetime.now(timezone.utc),
        "processing_status": "processing",
    }
    await db.documents.insert_one(record)

    indexed = False
    try:
        logger.info("Extracting document content: document_id=%s, name=%s", document_id, safe_name)
        blocks, total = extract_document(path, extension)
        if not blocks:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No readable text could be extracted from this document.",
            )

        logger.info("Chunking document: document_id=%s, blocks=%d", document_id, len(blocks))
        chunks = chunk_blocks(blocks, settings.chunk_size_tokens, settings.chunk_overlap_tokens)
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Document text could not be chunked for indexing.",
            )

        logger.info("Generating embeddings and indexing: document_id=%s, chunks=%d", document_id, len(chunks))
        vectors = await asyncio.to_thread(rag.embeddings.encode, [chunk.text for chunk in chunks])
        await rag.index(document_id, record["original_filename"], chunks, vectors)
        indexed = True

        record.update({
            "processing_status": "completed",
            "total_pages_or_slides": total,
            "total_chunks": len(chunks),
        })
        await db.documents.update_one(
            {"document_id": document_id},
            {"$set": {
                "processing_status": record["processing_status"],
                "total_pages_or_slides": total,
                "total_chunks": len(chunks),
            }},
        )
        logger.info("Successfully uploaded and indexed document: document_id=%s, chunks=%d", document_id, len(chunks))
        return _response(record)

    except HTTPException as exc:
        if indexed:
            try:
                await rag.delete_document(document_id)
            except Exception:
                logger.exception("Failed to rollback Qdrant index for %s", document_id)
        await _mark_processing_failed(db, document_id, str(exc))
        raise
    except Exception as exc:
        logger.exception("Document processing failed: document_id=%s, error=%s", document_id, exc)
        if indexed:
            try:
                await rag.delete_document(document_id)
            except Exception:
                logger.exception("Failed to rollback Qdrant index for %s", document_id)
        await _mark_processing_failed(db, document_id, str(exc))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Document processing failed: {exc}",
        ) from exc


async def _mark_processing_failed(db: object, document_id: str, error: str) -> None:
    try:
        await db.documents.update_one(
            {"document_id": document_id},
            {"$set": {"processing_status": "failed", "processing_error": error}},
        )
    except Exception:
        logger.exception("Failed to persist processing failure: document_id=%s", document_id)


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
    import re
    if not document_id or not document_id.strip() or not re.match(r"^[a-zA-Z0-9_\-]+$", document_id):
        logger.warning("Rejected document deletion due to invalid document_id format: %r", document_id)
        raise HTTPException(status_code=400, detail="Invalid document ID format.")

    if _rag is None:
        logger.error("RAG service is not initialized during document deletion")
        raise HTTPException(status_code=503, detail="RAG service is temporarily unavailable.")
    rag = _rag

    db = get_database()
    doc = await db.documents.find_one({"document_id": document_id})

    settings = get_settings()
    upload_dir = settings.upload_directory.resolve()
    target_dir = (upload_dir / document_id).resolve()

    # Security check: Ensure target_dir is strictly within the designated uploads directory
    try:
        target_dir.relative_to(upload_dir)
    except ValueError:
        logger.error("Security violation: attempt to delete outside uploads directory: %s", target_dir)
        raise HTTPException(status_code=400, detail="Invalid document storage path.")

    # 1. Delete associated vectors from Qdrant
    try:
        logger.info("Deleting Qdrant vectors for document_id=%s", document_id)
        await rag.delete_document(document_id)
        logger.info("Successfully deleted Qdrant vectors for document_id=%s", document_id)
    except Exception as exc:
        logger.error("Failed to delete Qdrant vectors for document_id=%s: %s", document_id, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document vectors from vector database: {exc}",
        ) from exc

    # 2. Delete physical file and directory from local storage
    try:
        file_path_str = doc.get("file_path") if doc else None
        target_file: Path | None = None
        if file_path_str:
            p = Path(file_path_str).resolve()
            try:
                p.relative_to(upload_dir)
                target_file = p
            except ValueError:
                target_file = None

        if target_file is None:
            filename = doc.get("filename", f"original.{doc.get('file_type', 'pdf')}") if doc else "original.pdf"
            target_file = (target_dir / filename).resolve()

        if target_file.exists():
            target_file.unlink(missing_ok=True)
            logger.info("Deleted physical file: %s", target_file)
        else:
            logger.info("Physical file was already absent: %s", target_file)

        if target_dir.exists():
            for sub in target_dir.iterdir():
                if sub.is_file():
                    sub.unlink(missing_ok=True)
            target_dir.rmdir()
            logger.info("Removed document directory: %s", target_dir)
    except Exception as exc:
        logger.error("Failed to delete local storage file for document_id=%s: %s", document_id, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document from local file storage: {exc}",
        ) from exc

    # 3. Delete metadata from MongoDB
    try:
        res = await db.documents.delete_one({"document_id": document_id})
        logger.info("Deleted MongoDB document record: document_id=%s (deleted_count=%d)", document_id, res.deleted_count)
    except Exception as exc:
        logger.error("Failed to delete MongoDB document record for document_id=%s: %s", document_id, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document metadata from database: {exc}",
        ) from exc

    doc_name = doc.get("original_filename", document_id) if doc else document_id
    return {
        "deleted": True,
        "id": document_id,
        "document_id": document_id,
        "name": doc_name,
        "message": f"Document '{doc_name}' has been permanently deleted from storage, vector index, and database.",
    }
