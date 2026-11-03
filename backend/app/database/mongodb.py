from typing import Any

from pymongo import ASCENDING, DESCENDING, AsyncMongoClient

from app.core.config import get_settings


client: AsyncMongoClient | None = None
database: Any = None


async def connect_mongodb() -> None:
    global client, database
    settings = get_settings()
    client = AsyncMongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=3000)
    await client.admin.command("ping")
    database = client[settings.mongodb_database]
    await database.documents.create_index([("created_at", DESCENDING)])
    await database.conversations.create_index([("updated_at", DESCENDING)])


async def close_mongodb() -> None:
    if client:
        await client.close()


def get_database() -> Any:
    if database is None:
        raise RuntimeError("MongoDB is not connected")
    return database

