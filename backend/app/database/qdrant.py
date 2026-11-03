from qdrant_client import AsyncQdrantClient, models

from app.core.config import get_settings


COLLECTION_NAME = "syllabix_chunks"
qdrant: AsyncQdrantClient | None = None


async def connect_qdrant() -> None:
    global qdrant
    settings = get_settings()
    qdrant = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
    collections = await qdrant.get_collections()
    if COLLECTION_NAME not in {item.name for item in collections.collections}:
        await qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )


async def close_qdrant() -> None:
    if qdrant:
        await qdrant.close()


def get_qdrant() -> AsyncQdrantClient:
    if qdrant is None:
        raise RuntimeError("Qdrant is not connected")
    return qdrant

