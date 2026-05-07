from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import Field


class AdminUser(Document):
    username: str = Field(..., min_length=3, max_length=64)
    password_hash: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "admin_users"
        indexes = [
            [("username", pymongo.ASCENDING)],
        ]
