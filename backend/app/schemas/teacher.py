from datetime import datetime

from pydantic import BaseModel, Field


class TeacherBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=128)
    name: str = Field(..., min_length=1, max_length=128)
    title: str | None = None
    rank: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    achievements: list[str] = Field(default_factory=list)
    order: int = 0
    visible: bool = True


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    slug: str | None = Field(None, min_length=1, max_length=128)
    name: str | None = Field(None, min_length=1, max_length=128)
    title: str | None = None
    rank: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    achievements: list[str] | None = None
    order: int | None = None
    visible: bool | None = None


class TeacherOut(TeacherBase):
    id: str
    created_at: datetime
    updated_at: datetime
