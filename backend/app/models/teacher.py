from datetime import datetime, timezone
from typing import Any

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

    # 任意結構化資料：教學理念、教學經歷、比賽戰績、教育背景、聯絡方式等
    # 前台 /teachers 頁會讀取已知 key 渲染對應區塊；老師後台用 JSON 編輯。
    extras: dict[str, Any] = Field(default_factory=dict)

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
