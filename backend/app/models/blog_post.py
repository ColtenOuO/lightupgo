from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import Field


class BlogPost(Document):
    slug: str = Field(..., min_length=1, max_length=128)
    title: str = Field(..., min_length=1, max_length=200)
    excerpt: str | None = None
    content: str = ""
    cover_image_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    author: str | None = None
    published: bool = False
    published_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "blog_posts"
        indexes = [
            [("slug", pymongo.ASCENDING)],
            [("published", pymongo.ASCENDING), ("published_at", pymongo.DESCENDING)],
        ]
