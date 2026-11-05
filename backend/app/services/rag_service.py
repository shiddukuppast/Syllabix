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

        fetch_limit = max(settings.retrieval_limit, 8)
        logger.info(
            "Executing Qdrant vector retrieval in collection '%s' (limit=%d, score_threshold=%.2f, filter=%s)",
            COLLECTION_NAME,
            fetch_limit,
            settings.retrieval_score_threshold,
            bool(query_filter),
        )

        results = None
        for attempt in range(1, settings.qdrant_max_retries + 1):
            try:
                results = await get_qdrant().query_points(
                    collection_name=COLLECTION_NAME,
                    query=vector,
                    limit=fetch_limit,
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
        logger.info("Qdrant initial retrieval completed: retrieved %d candidate points", len(retrieved_points))

        candidate_items = [{"score": item.score, **(item.payload or {})} for item in retrieved_points]

        # Neighboring chunk expansion: for top matches, ensure next consecutive chunk is available
        retrieved_keys = {
            (item.get("document_id"), item.get("chunk_index"))
            for item in candidate_items
            if item.get("document_id") is not None and item.get("chunk_index") is not None
        }

        missing_neighbors: list[tuple[str, int, float]] = []
        for item in candidate_items:
            doc_id = item.get("document_id")
            idx = item.get("chunk_index")
            score = item.get("score", 0.0)
            if doc_id and idx is not None and score >= 0.35:
                next_key = (doc_id, idx + 1)
                if next_key not in retrieved_keys:
                    missing_neighbors.append((doc_id, idx + 1, score * 0.92))
                    retrieved_keys.add(next_key)

        if missing_neighbors:
            logger.info("Checking neighbor expansion for %d adjacent chunks", len(missing_neighbors))
            client = get_qdrant()
            for doc_id, next_idx, proxy_score in missing_neighbors[:3]:
                try:
                    neighbor_filter = models.Filter(
                        must=[
                            models.FieldCondition(key="document_id", match=models.MatchValue(value=doc_id)),
                            models.FieldCondition(key="chunk_index", match=models.MatchValue(value=next_idx)),
                        ]
                    )
                    n_res, _ = await client.scroll(
                        collection_name=COLLECTION_NAME,
                        scroll_filter=neighbor_filter,
                        limit=1,
                        with_payload=True,
                    )
                    if n_res:
                        n_point = n_res[0]
                        candidate_items.append({"score": proxy_score, **(n_point.payload or {})})
                        logger.info(
                            "Neighbor expansion included adjacent chunk: doc=%s, chunk_index=%d, page=%s",
                            doc_id,
                            next_idx,
                            n_point.payload.get("page_number"),
                        )
                except Exception as n_err:
                    logger.warning("Neighbor expansion lookup skipped: %s", n_err)

        # Sort candidate items by document and sequential chunk_index for continuous narrative reading
        candidate_items.sort(
            key=lambda x: (
                str(x.get("document_id") or ""),
                int(x.get("chunk_index") if x.get("chunk_index") is not None else 9999),
            )
        )

        for i, item in enumerate(candidate_items, 1):
            logger.info(
                "Retrieved Chunk #%d: score=%.4f | doc=%s | page=%s | index=%s | section=%s | snippet=%s",
                i,
                item.get("score", 0.0),
                item.get("filename"),
                item.get("location"),
                item.get("chunk_index"),
                item.get("section_heading"),
                repr(item.get("chunk_text", "")[:80]),
            )

        return candidate_items

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

        context_blocks = []
        for item in results:
            heading_info = f" | Section: {item['section_heading']}" if item.get("section_heading") else ""
            context_blocks.append(
                f"Source: {item.get('filename')}, {item.get('location', 'Document')}{heading_info}\n"
                f"{item['chunk_text']}"
            )
        context = "\n\n".join(context_blocks)

        logger.info(
            "Calling LLM answer generation with context length=%d chars across %d chunks",
            len(context),
            len(results),
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
            await ensure_collection_and_payload_index(client=get_qdrant())
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
