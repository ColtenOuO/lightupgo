"""種一些範例公告。重複跑會以 title 去重，已存在就跳過。

執行：
    docker compose exec backend python -m scripts.seed_announcements
"""
import asyncio
from datetime import datetime, timezone

from app.core.database import close_db, init_db
from app.models.announcement import Announcement

ITEMS = [
    {
        "title": "2026 春季招生開放中",
        "body": "啟蒙班、進階班、段位班皆有空缺，歡迎來電預約免費試聽。",
        "tag": "招生",
        "link_url": "/register",
        "link_text": "預約試聽",
        "pinned": True,
    },
    {
        "title": "5/24（六）端午連假停課一次",
        "body": "請各位家長注意，5/24 全日停課，5/31 起恢復正常上課。",
        "tag": "停課",
    },
    {
        "title": "恭喜學員於 2026 打狗盃 多人獲獎",
        "body": "陳同學丁組亞軍、季軍各一，更多照片請見「相簿」。",
        "tag": "比賽",
        "link_url": "/gallery",
        "link_text": "看比賽相簿",
    },
]


async def main() -> None:
    await init_db()
    try:
        created = 0
        for data in ITEMS:
            if await Announcement.find_one(Announcement.title == data["title"]):
                continue
            await Announcement(
                **data,
                published_at=datetime.now(timezone.utc),
            ).insert()
            created += 1
        print(f"Seed announcements done. +{created}")
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
