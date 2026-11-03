from qdrant_client import models

from app.core.config import get_settings
from app.database.qdrant import COLLECTION_NAME, get_qdrant
from app.schemas.chat import SourceReference
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService


class RAGService:
    def __init__(self, embeddings: EmbeddingService, llm: LLMService):
        self.embeddings = embeddings
        self.llm = llm

    async def retrieve(self, question: str) -> list[dict]:
        settings = get_settings()
        vector = self.embeddings.encode([question])[0]
        results = await get_qdrant().query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=settings.retrieval_limit,
            score_threshold=settings.retrieval_score_threshold,
            with_payload=True,
        )
        return [{"score": item.score, **(item.payload or {})} for item in results.points]

    async def answer(self, question: str, history: str, mode: str, detail: str) -> tuple[str, str | None, list[SourceReference]]:
        results = await self.retrieve(question)
        context = "\n\n".join(f"[{item.get('filename')} {item.get('location')}]\n{item['chunk_text']}" for item in results)
        answer, additional = await self.llm.answer(question, context or "(No relevant syllabus context found.)", history, mode, detail)
        sources = [
            SourceReference(doc_name=item["filename"], page=item.get("location", "Document"), snippet=item["chunk_text"][:300], match_score=round(item["score"] * 100))
            for item in results
        ]
        return answer, additional, sources

    async def index(self, document_id: str, filename: str, chunks: list, embeddings: list[list[float]]) -> None:
        points = []
        for chunk, vector in zip(chunks, embeddings):
            location = f"Page {chunk.page_number}" if chunk.page_number else f"Slide {chunk.slide_number}" if chunk.slide_number else "Document"
            points.append(models.PointStruct(id=f"{document_id}:{chunk.index}", vector=vector, payload={
                "document_id": document_id, "chunk_id": f"{document_id}:{chunk.index}", "chunk_text": chunk.text,
                "filename": filename, "page_number": chunk.page_number, "slide_number": chunk.slide_number,
                "section_heading": chunk.section_heading, "chunk_index": chunk.index, "location": location,
            }))
        if points:
            await get_qdrant().upsert(collection_name=COLLECTION_NAME, points=points)

    async def delete_document(self, document_id: str) -> None:
        await get_qdrant().delete(collection_name=COLLECTION_NAME, points_selector=models.FilterSelector(
            filter=models.Filter(must=[models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id))])
        ))

