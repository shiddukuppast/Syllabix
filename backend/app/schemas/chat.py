from typing import Literal

from pydantic import BaseModel, Field


StudyMode = Literal["Syllabus + AI", "Strict Syllabus"]


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=10000)
    conversation_id: str | None = None
    document_ids: list[str] | None = None
    mode: StudyMode = "Syllabus + AI"
    detail: Literal["concise", "balanced", "comprehensive"] = "balanced"


class SourceReference(BaseModel):
    doc_name: str
    page: str | int
    snippet: str
    match_score: int | None = None
    document_id: str | None = None
    chunk_id: str | None = None
    page_number: int | None = None
    slide_number: int | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    additional_ai_knowledge: str | None = None
    sources: list[SourceReference] = []
