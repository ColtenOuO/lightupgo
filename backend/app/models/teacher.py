from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import Field


class Teacher(Document):
    slug: str = Field(..., min_length=1, max_length=128)
    name: str = Field(..., min_length=1, max_length=128)
    title: str | None = None
    rank: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    achievements: list[str] = Field(default_factory=list)
    order: int = 0
    visible: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "teachers"
        indexes = [
            [("slug", pymongo.ASCENDING)],
            [("order", pymongo.ASCENDING)],
        ]
