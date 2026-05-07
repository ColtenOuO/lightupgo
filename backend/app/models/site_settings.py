from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import Field

GLOBAL_KEY = "global"


class SiteSettings(Document):
    """全站設定（單筆文件，key 永遠是 "global"）。

    後台可改：站名、標語、聯絡資訊、報名表嵌入網址、SEO meta、社群連結等。
    """

    key: str = GLOBAL_KEY

    site_name: str = "立光圍棋教室"
    tagline: str = "讓每一步都更有想法"
    hero_subtitle: str | None = None

    phone: str | None = None
    address: str | None = None
    business_hours: str | None = None

    register_form_url: str | None = None
    register_form_note: str | None = None

    meta_description: str | None = None
    meta_keywords: list[str] = Field(default_factory=list)

    facebook_url: str | None = None
    instagram_url: str | None = None
    line_id: str | None = None
    youtube_url: str | None = None

    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "site_settings"
        indexes = [
            [("key", pymongo.ASCENDING)],
        ]
