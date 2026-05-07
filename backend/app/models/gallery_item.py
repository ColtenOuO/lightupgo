from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import Field


class GalleryItem(Document):
    title: str | None = None
    description: str | None = None
    image_url: str = Field(..., min_length=1)
    category: str | None = None
    taken_at: datetime | None = None
    order: int = 0
    visible: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "gallery_items"
        indexes = [
            [("category", pymongo.ASCENDING), ("order", pymongo.ASCENDING)],
        ]
