from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import Field


class Announcement(Document):
    """公告欄項目。

    用途：停課通知、招生開放、比賽資訊、活動推薦等。
    pinned=True 的會被釘在最上面；超過 expires_at 的不會在公開 API 出現。
    """

    title: str = Field(..., min_length=1, max_length=200)
    body: str | None = None
    tag: str | None = None  # 例：公告 / 活動 / 比賽 / 停課
    link_url: str | None = None
    link_text: str | None = None

    pinned: bool = False
    published: bool = True

    # 預定發佈時間 / 自動下架時間（皆可為空）
    published_at: datetime | None = None
    expires_at: datetime | None = None

    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "announcements"
        indexes = [
            [("pinned", pymongo.DESCENDING), ("published_at", pymongo.DESCENDING)],
            [("published", pymongo.ASCENDING)],
        ]
