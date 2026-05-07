from datetime import datetime, timezone
from typing import Any

import pymongo
from beanie import Document
from pydantic import Field


class Card(Document):
    """前台可由管理者編輯的「卡片」內容。

    一張 Card 可以是首頁 Hero、why-us 條目、統計數字、CTA 區塊等。
    前台依 `page` + `section` 抓取並依 `order` 排序顯示。
    """

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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "cards"
        indexes = [
            [("slug", pymongo.ASCENDING)],
            [("page", pymongo.ASCENDING), ("section", pymongo.ASCENDING), ("order", pymongo.ASCENDING)],
        ]
