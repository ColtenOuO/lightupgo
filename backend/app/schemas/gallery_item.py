from datetime import datetime

from pydantic import BaseModel, Field


class GalleryItemBase(BaseModel):
    title: str | None = None
    description: str | None = None
    image_url: str = Field(..., min_length=1)
    category: str | None = None
    taken_at: datetime | None = None
    order: int = 0
    visible: bool = True


class GalleryItemCreate(GalleryItemBase):
    pass


class GalleryItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    image_url: str | None = Field(None, min_length=1)
    category: str | None = None
    taken_at: datetime | None = None
    order: int | None = None
    visible: bool | None = None


class GalleryItemOut(GalleryItemBase):
    id: str
    created_at: datetime
    updated_at: datetime
