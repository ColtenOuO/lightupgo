from datetime import datetime

from pydantic import BaseModel, Field


class CourseBase(BaseModel):
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


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    slug: str | None = Field(None, min_length=1, max_length=128)
    name: str | None = Field(None, min_length=1, max_length=128)
    level: str | None = Field(None, max_length=64)
    description: str | None = None
    age_range: str | None = None
    duration: str | None = None
    schedule: str | None = None
    price: str | None = None
    image_url: str | None = None
    features: list[str] | None = None
    order: int | None = None
    visible: bool | None = None


class CourseOut(CourseBase):
    id: str
    created_at: datetime
    updated_at: datetime
