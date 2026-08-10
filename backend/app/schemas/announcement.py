from datetime import datetime

from pydantic import BaseModel, Field


class AnnouncementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    body: str | None = None
    tag: str | None = None
    link_url: str | None = None
    link_text: str | None = None
    pinned: bool = False
    published: bool = True
    published_at: datetime | None = None
    expires_at: datetime | None = None
    order: int = 0


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    body: str | None = None
    tag: str | None = None
    link_url: str | None = None
    link_text: str | None = None
    pinned: bool | None = None
    published: bool | None = None
    published_at: datetime | None = None
    expires_at: datetime | None = None
    order: int | None = None


class AnnouncementOut(AnnouncementBase):
    id: str
    created_at: datetime
    updated_at: datetime
