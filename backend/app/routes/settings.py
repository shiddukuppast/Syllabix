from fastapi import APIRouter

from app.schemas.settings import SettingsSchema

router = APIRouter(prefix="/api/settings", tags=["settings"])
settings = SettingsSchema()


@router.get("")
async def get_settings() -> SettingsSchema:
    return settings


@router.patch("")
async def update_settings(update: SettingsSchema) -> SettingsSchema:
    global settings
    settings = update
    return settings

