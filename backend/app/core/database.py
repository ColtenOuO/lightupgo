from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models import all_documents

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global _client
    _client = AsyncIOMotorClient(settings.MONGO_URL)
    await init_beanie(
        database=_client[settings.MONGO_DB_NAME],
        document_models=all_documents,
    )


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
