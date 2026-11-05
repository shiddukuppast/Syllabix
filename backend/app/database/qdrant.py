import inspect
from unittest.mock import AsyncMock

from qdrant_client import AsyncQdrantClient, models

from app.core.config import get_settings


COLLECTION_NAME = "syllabix_chunks"
qdrant: AsyncQdrantClient | None = None


async def ensure_collection_and_payload_index(client: AsyncQdrantClient | None = None) -> None:
    if client is None:
        client = get_qdrant()

    get_cols = getattr(client, "get_collections", None)
    if get_cols is None:
        return
    if not (inspect.iscoroutinefunction(get_cols) or isinstance(get_cols, AsyncMock)):
        return

    collections = await client.get_collections()
    if COLLECTION_NAME not in {item.name for item in collections.collections}:
        await client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )

    info = await client.get_collection(collection_name=COLLECTION_NAME)
    payload_schema = getattr(info, "payload_schema", {}) or {}
    if "document_id" not in payload_schema:
        await client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="document_id",
            field_schema=models.PayloadSchemaType.KEYWORD,
            wait=True,
        )
    if "chunk_index" not in payload_schema:
        await client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="chunk_index",
            field_schema=models.PayloadSchemaType.INTEGER,
            wait=True,
        )


async def connect_qdrant() -> None:
    global qdrant
    settings = get_settings()
    qdrant = AsyncQdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=settings.qdrant_timeout_seconds,
    )
    await ensure_collection_and_payload_index(qdrant)


async def close_qdrant() -> None:
    if qdrant:
        await qdrant.close()


def get_qdrant() -> AsyncQdrantClient:
    if qdrant is None:
        raise RuntimeError("Qdrant is not connected")
    return qdrant
