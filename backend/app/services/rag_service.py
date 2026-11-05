import asyncio
import logging
import uuid

import httpx
from qdrant_client import models
from qdrant_client.http.exceptions import ResponseHandlingException, UnexpectedResponse

from app.core.config import get_settings
from app.database.qdrant import COLLECTION_NAME, ensure_collection_and_payload_index, get_qdrant
from app.schemas.chat import SourceReference
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class NoRetrievedContextError(Exception):
    """Raised when no indexed chunks are available for a question."""


def _is_transient_error(exc: Exception) -> bool:
    if isinstance(exc, (httpx.TimeoutException, httpx.NetworkError, TimeoutError, ResponseHandlingException)):
        return True
    if isinstance(exc, UnexpectedResponse):
        return exc.status_code in {429, 500, 502, 503, 504}
    return False


class RAGService:
    def __init__(self, embeddings: EmbeddingService, llm: LLMService):
        self.embeddings = embeddings
        self.llm = llm

    async def retrieve(self, question: str, document_ids: list[str] | None = None) -> list[dict]:
        settings = get_settings()
        logger.info("Generating query embedding for question (length=%d chars)", len(question))
        vector = (await asyncio.to_thread(self.embeddings.encode, [question]))[0]
        if len(vector) != 384:
            raise ValueError(f"Query embedding dimension {len(vector)} does not match expected 384.")
        logger.info("Query embedding generated successfully (dimension=%d)", len(vector))

        query_filter = None
        if document_ids:
            query_filter = models.Filter(
                should=[
                    models.FieldCondition(
                        key="document_id",
                        match=models.MatchValue(value=document_id),
                    )
                    for document_id in document_ids
                ]
            )
        logger.info(
            "Executing Qdrant vector retrieval in collection '%s' (limit=%d, score_threshold=%.2f, filter=%s)",
            COLLECTION_NAME,
            settings.retrieval_limit,
            settings.retrieval_score_threshold,
            bool(query_filter),
        )

        results = None
        for attempt in range(1, settings.qdrant_max_retries + 1):
            try:
                results = await get_qdrant().query_points(
                    collection_name=COLLECTION_NAME,
                    query=vector,
                    limit=settings.retrieval_limit,
                    score_threshold=settings.retrieval_score_threshold,
                    query_filter=query_filter,
                    with_payload=True,
                    timeout=int(settings.qdrant_timeout_seconds),
                )
                break
            except Exception as exc:
                if _is_transient_error(exc) and attempt < settings.qdrant_max_retries:
                    backoff = 1.0 * (2 ** (attempt - 1))
                    logger.warning(
                        "Transient failure in Qdrant retrieval query (attempt %d/%d): %s. Retrying in %.1fs...",
                        attempt,
                        settings.qdrant_max_retries,
                        exc,
                        backoff,
                    )
                    await asyncio.sleep(backoff)
                else:
                    logger.error("Qdrant retrieval failed after %d attempts: %s", attempt, exc)
                    raise

        retrieved_points = results.points if results and hasattr(results, "points") else []
        logger.info("Qdrant retrieval completed: retrieved %d chunks", len(retrieved_points))
        return [{"score": item.score, **(item.payload or {})} for item in retrieved_points]

    async def answer(
        self,
        question: str,
        history: str,
        mode: str,
        detail: str,
        document_ids: list[str] | None = None,
    ) -> tuple[str, str | None, list[SourceReference]]:
        results = await self.retrieve(question, document_ids)
        if not results:
            logger.info("No retrieved chunks matched score threshold for query: '%s'", question[:80])
            raise NoRetrievedContextError(
                "No indexed document content is available for this question."
            )
        context = "\n\n".join(
            f"Source: {item.get('filename')}, {item.get('location', 'Document')}\n"
            f"{item['chunk_text']}"
            for item in results
        )
        answer, additional = await self.llm.answer(question, context or "(No relevant syllabus context found.)", history, mode, detail)
        sources = [
            SourceReference(
                doc_name=item["filename"],
                page=item.get("location", "Document"),
                snippet=item["chunk_text"][:300],
                match_score=round(item["score"] * 100),
                document_id=item.get("document_id"),
                chunk_id=item.get("chunk_id"),
                page_number=item.get("page_number"),
                slide_number=item.get("slide_number"),
            )
            for item in results
        ]
        return answer, additional, sources

    async def _upsert_batches(self, document_id: str, points: list[models.PointStruct]) -> None:
        settings = get_settings()
        batch_size = max(1, settings.qdrant_batch_size)
        max_retries = max(1, settings.qdrant_max_retries)
        timeout_seconds = int(settings.qdrant_timeout_seconds)
        total_points = len(points)
        total_batches = (total_points + batch_size - 1) // batch_size
        client = get_qdrant()

        for i in range(0, total_points, batch_size):
            batch = points[i : i + batch_size]
            batch_num = (i // batch_size) + 1

            for attempt in range(1, max_retries + 1):
                try:
                    logger.info(
                        "Upserting Qdrant batch %d/%d (%d points) for document_id=%s (attempt %d/%d)",
                        batch_num,
                        total_batches,
                        len(batch),
                        document_id,
                        attempt,
                        max_retries,
                    )
                    await client.upsert(
                        collection_name=COLLECTION_NAME,
                        points=batch,
                        wait=True,
                        timeout=timeout_seconds,
                    )
                    logger.info(
                        "Successfully upserted Qdrant batch %d/%d for document_id=%s",
                        batch_num,
                        total_batches,
                        document_id,
                    )
                    break
                except Exception as exc:
                    if _is_transient_error(exc) and attempt < max_retries:
                        backoff = 1.0 * (2 ** (attempt - 1))
                        logger.warning(
                            "Transient failure in Qdrant batch %d/%d for document_id=%s (attempt %d/%d): %s. Retrying in %.1fs...",
                            batch_num,
                            total_batches,
                            document_id,
                            attempt,
                            max_retries,
                            exc,
                            backoff,
                        )
                        await asyncio.sleep(backoff)
                    else:
                        logger.error(
                            "Failed to upsert Qdrant batch %d/%d for document_id=%s after %d attempts: %s",
                            batch_num,
                            total_batches,
                            document_id,
                            attempt,
                            exc,
                        )
                        raise

    async def index(self, document_id: str, filename: str, chunks: list, embeddings: list[list[float]]) -> None:
        if len(chunks) != len(embeddings):
            raise ValueError("Chunk and embedding counts do not match.")
        points = []
        for chunk, vector in zip(chunks, embeddings):
            if len(vector) != 384:
                raise ValueError(f"Chunk embedding dimension {len(vector)} does not match expected 384.")
            location = f"Page {chunk.page_number}" if chunk.page_number else f"Slide {chunk.slide_number}" if chunk.slide_number else "Document"
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}:{chunk.chunk_id}"))
            points.append(models.PointStruct(id=point_id, vector=vector, payload={
                "document_id": document_id, "chunk_id": chunk.chunk_id, "chunk_text": chunk.text,
                "filename": filename, "page_number": chunk.page_number, "slide_number": chunk.slide_number,
                "section": chunk.section_heading, "section_heading": chunk.section_heading,
                "chunk_index": chunk.index, "location": location,
            }))
        if points:
            await ensure_collection_and_payload_index()
            await self.delete_document(document_id)
            await self._upsert_batches(document_id, points)

    async def delete_document(self, document_id: str) -> None:
        await get_qdrant().delete(
            collection_name=COLLECTION_NAME,
            points_selector=models.FilterSelector(
                filter=models.Filter(must=[models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id))])
            ),
            wait=True,
        )
