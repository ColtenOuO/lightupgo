from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import Field


class Course(Document):
    slug: str = Field(..., min_length=1, max_length=128)
    name: str = Field(..., min_length=1, max_length=128)
    level: str = Field(..., max_length=64)
    description: str | None = None
    age_range: str | None = None
    duration: str | None = None
    schedule: str | None = None
    price: str | None = None
    image_url: str | None = None
    features: list[str] = Field(default_factory=list)
    order: int = 0
    visible: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "courses"
        indexes = [
            [("slug", pymongo.ASCENDING)],
            [("order", pymongo.ASCENDING)],
        ]
