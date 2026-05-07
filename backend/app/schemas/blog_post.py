from datetime import datetime

from pydantic import BaseModel, Field


class BlogPostBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=128)
    title: str = Field(..., min_length=1, max_length=200)
    excerpt: str | None = None
    content: str = ""
    cover_image_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    author: str | None = None
    published: bool = False
    published_at: datetime | None = None


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    slug: str | None = Field(None, min_length=1, max_length=128)
    title: str | None = Field(None, min_length=1, max_length=200)
    excerpt: str | None = None
    content: str | None = None
    cover_image_url: str | None = None
    tags: list[str] | None = None
    author: str | None = None
    published: bool | None = None
    published_at: datetime | None = None


class BlogPostOut(BlogPostBase):
    id: str
    created_at: datetime
    updated_at: datetime
