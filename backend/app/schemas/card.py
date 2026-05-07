from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class CardBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=128)
    page: str = Field(..., min_length=1, max_length=64)
    section: str = Field(..., min_length=1, max_length=64)
    order: int = 0
    title: str | None = None
    subtitle: str | None = None
    body: str | None = None
    image_url: str | None = None
    icon: str | None = None
    cta_text: str | None = None
    cta_url: str | None = None
    extras: dict[str, Any] = Field(default_factory=dict)
    visible: bool = True


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    slug: str | None = Field(None, min_length=1, max_length=128)
    page: str | None = Field(None, min_length=1, max_length=64)
    section: str | None = Field(None, min_length=1, max_length=64)
    order: int | None = None
    title: str | None = None
    subtitle: str | None = None
    body: str | None = None
    image_url: str | None = None
    icon: str | None = None
    cta_text: str | None = None
    cta_url: str | None = None
    extras: dict[str, Any] | None = None
    visible: bool | None = None


class CardOut(CardBase):
    id: str
    created_at: datetime
    updated_at: datetime


class CardReorderItem(BaseModel):
    id: str
    order: int
