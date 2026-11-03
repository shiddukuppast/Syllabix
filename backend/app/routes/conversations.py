from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.database.mongodb import get_database

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


class ConversationPatch(BaseModel):
    title: str = Field(min_length=1, max_length=120)


def _summary(doc: dict) -> dict:
    messages = doc.get("messages", [])
    return {"id": doc["conversation_id"], "title": doc["title"], "preview": messages[-1]["content"] if messages else "", "updatedAt": doc["updated_at"].isoformat(), "mode": doc.get("mode", "Syllabus + AI"), "messages": messages}


@router.post("")
async def create_conversation() -> dict:
    now = datetime.now(timezone.utc)
    doc = {"conversation_id": uuid4().hex, "title": "New study chat", "messages": [], "created_at": now, "updated_at": now, "mode": "Syllabus + AI"}
    await get_database().conversations.insert_one(doc)
    return _summary(doc)


@router.get("")
async def list_conversations() -> list[dict]:
    return [_summary(doc) async for doc in get_database().conversations.find().sort("updated_at", -1)]


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str) -> dict:
    doc = await get_database().conversations.find_one({"conversation_id": conversation_id})
    if not doc:
        raise HTTPException(404, "Conversation not found")
    return _summary(doc)


@router.patch("/{conversation_id}")
async def rename_conversation(conversation_id: str, patch: ConversationPatch) -> dict:
    result = await get_database().conversations.update_one({"conversation_id": conversation_id}, {"$set": {"title": patch.title, "updated_at": datetime.now(timezone.utc)}})
    if not result.matched_count:
        raise HTTPException(404, "Conversation not found")
    return await get_conversation(conversation_id)


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str) -> dict:
    result = await get_database().conversations.delete_one({"conversation_id": conversation_id})
    if not result.deleted_count:
        raise HTTPException(404, "Conversation not found")
    return {"deleted": True}

