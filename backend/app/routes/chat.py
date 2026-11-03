from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.database.mongodb import get_database
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import (
    LLMConfigurationError,
    LLMContentFilterError,
    LLMEmptyResponseError,
    LLMError,
    LLMModelNotFoundError,
    LLMQuotaExceededError,
    LLMTimeoutError,
)
from app.services.rag_service import RAGService

router = APIRouter(prefix="/api/chat", tags=["chat"])
_rag: RAGService | None = None


def set_rag_service(rag: RAGService) -> None:
    global _rag
    _rag = rag


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    db = get_database()
    conversation_id = request.conversation_id
    if conversation_id:
        conversation = await db.conversations.find_one({"conversation_id": conversation_id})
        if not conversation:
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
        raise HTTPException(503, "RAG service is not initialized")
    rag = _rag

    try:
        answer, additional, sources = await rag.answer(
            request.question, history, request.mode, request.detail
        )
    except LLMConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except LLMQuotaExceededError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc
    except LLMTimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except LLMModelNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LLMContentFilterError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except LLMEmptyResponseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

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
    await db.conversations.replace_one(
        {"conversation_id": conversation_id}, conversation, upsert=True
    )
    return ChatResponse(
        conversation_id=conversation_id,
        message_id=assistant_message["message_id"],
        answer=answer,
        additional_ai_knowledge=additional,
        sources=sources,
    )
