import logging
import time
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.database.mongodb import get_database
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import (
    LLMAPIError,
    LLMConfigurationError,
    LLMContentFilterError,
    LLMEmptyResponseError,
    LLMError,
    LLMModelNotFoundError,
    LLMQuotaExceededError,
    LLMServiceUnavailableError,
    LLMTimeoutError,
)
from app.services.rag_service import NoRetrievedContextError, RAGService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])
_rag: RAGService | None = None


def set_rag_service(rag: RAGService) -> None:
    global _rag
    _rag = rag


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    started = time.perf_counter()
    logger.info(
        "Chat request received: mode='%s', detail='%s', conversation_id=%s, question_length=%d",
        request.mode,
        request.detail,
        request.conversation_id,
        len(request.question),
    )
    try:
        return await _chat_impl(request)
    finally:
        logger.info(
            "Chat request completed in %.3fs",
            time.perf_counter() - started,
        )


async def _chat_impl(request: ChatRequest) -> ChatResponse:
    db = get_database()
    doc_count = await db.documents.count_documents({})
    logger.info("Active indexed documents in database: %d", doc_count)

    conversation_id = request.conversation_id
    if conversation_id:
        conversation = await db.conversations.find_one({"conversation_id": conversation_id})
        if not conversation:
            logger.warning("Conversation not found: conversation_id=%s", conversation_id)
            raise HTTPException(404, "Conversation not found")
    else:
        now = datetime.now(timezone.utc)
        conversation_id = uuid4().hex
        conversation = {
            "conversation_id": conversation_id,
            "title": request.question[:60],
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }
    history = "\n".join(
        f"{message['role']}: {message['content']}"
        for message in conversation.get("messages", [])[-6:]
    )
    if _rag is None:
        logger.error("RAG service is requested but not initialized")
        raise HTTPException(503, "RAG indexing service is temporarily unavailable.")
    rag = _rag

    try:
        answer, additional, sources = await rag.answer(
            request.question,
            history,
            request.mode,
            request.detail,
            request.document_ids,
        )
    except LLMServiceUnavailableError as exc:
        logger.warning("Chat failed - Groq service high demand/unavailable (HTTP 503): %s", exc)
        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily experiencing high demand. Your documents are safe. Please try again shortly.",
        ) from exc
    except LLMConfigurationError as exc:
        logger.error("Chat failed due to Groq configuration/auth: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=503, detail=f"Groq configuration error: {exc}") from exc
    except LLMQuotaExceededError as exc:
        logger.warning("Chat failed due to Groq quota: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=429, detail=f"Groq rate limit or quota exceeded: {exc}") from exc
    except LLMTimeoutError as exc:
        logger.error("Chat failed due to Groq request timeout: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=504, detail=f"Groq request timed out: {exc}") from exc
    except LLMModelNotFoundError as exc:
        logger.error("Chat failed due to model not found: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=400, detail=f"Groq model not found: {exc}") from exc
    except LLMContentFilterError as exc:
        logger.warning("Chat content blocked by safety filters: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=422, detail=f"Content blocked by safety policy: {exc}") from exc
    except LLMEmptyResponseError as exc:
        logger.error("Chat failed: Groq returned an empty response")
        raise HTTPException(status_code=502, detail="Groq returned an empty response.") from exc
    except LLMAPIError as exc:
        logger.error("Chat failed due to Groq upstream API error: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=502, detail=f"Groq API error: {exc}") from exc
    except LLMError as exc:
        logger.error("Chat failed due to LLM service error: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=502, detail=f"LLM service error: {exc}") from exc
    except NoRetrievedContextError as exc:
        logger.info("Chat notice - No relevant syllabus context retrieved: %s", exc)
        raise HTTPException(status_code=404, detail="No relevant document content found for your question.") from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error during chat processing: %s (type=%s)", exc, type(exc).__name__)
        raise HTTPException(status_code=500, detail=f"Internal chat error: {exc}") from exc

    now_iso = datetime.now(timezone.utc).isoformat()
    user_message = {
        "message_id": uuid4().hex,
        "role": "user",
        "content": request.question,
        "timestamp": now_iso,
        "answering_mode": request.mode,
        "sources": [],
    }
    assistant_message = {
        "message_id": uuid4().hex,
        "role": "assistant",
        "content": answer,
        "timestamp": now_iso,
        "answering_mode": request.mode,
        "sources": [source.model_dump() for source in sources],
        "additional_ai_knowledge": additional,
    }
    conversation["messages"] = conversation.get("messages", []) + [user_message, assistant_message]
    conversation["mode"] = request.mode
    conversation["updated_at"] = datetime.now(timezone.utc)

    logger.info(
        "Persisting conversation to MongoDB: conversation_id=%s, total_messages=%d",
        conversation_id,
        len(conversation["messages"]),
    )
    await db.conversations.replace_one(
        {"conversation_id": conversation_id}, conversation, upsert=True
    )
    logger.info("MongoDB persistence completed successfully for conversation_id=%s", conversation_id)

    return ChatResponse(
        conversation_id=conversation_id,
        message_id=assistant_message["message_id"],
        answer=answer,
        additional_ai_knowledge=additional,
        sources=sources,
    )
