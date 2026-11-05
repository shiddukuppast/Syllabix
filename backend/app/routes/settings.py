from fastapi import APIRouter

from app.schemas.settings import SettingsSchema

router = APIRouter(prefix="/api/settings", tags=["settings"])
settings = SettingsSchema()


@router.get("")
async def get_settings() -> SettingsSchema:
    try:
        from app.database.mongodb import database

        if database is not None:
            doc = await database.settings.find_one({"_id": "user_settings"})
            if doc:
                doc.pop("_id", None)
                return SettingsSchema(**doc)
    except Exception:
        pass
    return settings


@router.patch("")
async def update_settings(update: SettingsSchema) -> SettingsSchema:
    global settings
    settings = update
    try:
        from app.database.mongodb import database

        if database is not None:
            await database.settings.update_one(
                {"_id": "user_settings"},
                {"$set": update.model_dump()},
                upsert=True,
            )
    except Exception:
        pass
    return settings
