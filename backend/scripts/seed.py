"""填入預設資料（依現行 lightupgo.win 內容）。

使用方式（在 backend/ 資料夾下）：
    python -m scripts.seed

可重複執行：以 slug / key 為主鍵，已存在的資料會略過不覆寫。
"""
import asyncio

from app.core.database import close_db, init_db
from app.models.card import Card
from app.models.course import Course
from app.models.site_settings import GLOBAL_KEY, SiteSettings
from app.models.teacher import Teacher

CARDS = [
    # ── Hero ──────────────────────────────
    {
        "slug": "home_hero",
        "page": "home",
        "section": "hero",
        "order": 0,
        "title": "讓每一步都更有想法",
        "subtitle": "立光圍棋教室",
        "body": "從第一手到段級檢定，陪伴孩子在棋盤上培養專注、邏輯與勇氣。",
        "cta_text": "免費試聽",
        "cta_url": "/register",
        "icon": "sparkles",
    },
    # ── Stats ─────────────────────────────
    {
        "slug": "stats_teachers",
        "page": "home",
        "section": "stats",
        "order": 0,
        "title": "1",
        "subtitle": "位專業老師",
        "icon": "user-round",
    },
    {
        "slug": "stats_students",
        "page": "home",
        "section": "stats",
        "order": 1,
        "title": "100+",
        "subtitle": "在學學員",
        "icon": "users-round",
    },
    {
        "slug": "stats_years",
        "page": "home",
        "section": "stats",
        "order": 2,
        "title": "5+",
        "subtitle": "年教學經驗",
        "icon": "calendar-days",
    },
    {
        "slug": "stats_awards",
        "page": "home",
        "section": "stats",
        "order": 3,
        "title": "30+",
        "subtitle": "比賽獎項",
        "icon": "trophy",
    },
    # ── Why Us ────────────────────────────
    {
        "slug": "why_us_pro",
        "page": "home",
        "section": "why_us",
        "order": 0,
        "title": "專業師資",
        "body": "業餘段位老師親自授課，因材施教。",
        "icon": "award",
    },
    {
        "slug": "why_us_small",
        "page": "home",
        "section": "why_us",
        "order": 1,
        "title": "小班制 6–12 人",
        "body": "每位孩子都有充足的對局與指導機會。",
        "icon": "user-check",
    },
    {
        "slug": "why_us_compete",
        "page": "home",
        "section": "why_us",
        "order": 2,
        "title": "比賽機會多",
        "body": "定期參與全國性段級檢定與兒童圍棋賽。",
        "icon": "trophy",
    },
    {
        "slug": "why_us_fun",
        "page": "home",
        "section": "why_us",
        "order": 3,
        "title": "快樂學習",
        "body": "遊戲、故事、手腦並用，把圍棋變得好玩。",
        "icon": "smile",
    },
    # ── CTA bottom ────────────────────────
    {
        "slug": "home_cta_bottom",
        "page": "home",
        "section": "cta",
        "order": 0,
        "title": "幫孩子開啟下棋的第一步",
        "subtitle": "立刻預約免費試聽課",
        "cta_text": "立即報名",
        "cta_url": "/register",
        "icon": "sparkles",
    },
]

COURSES = [
    {
        "slug": "beginner",
        "name": "入門班",
        "level": "beginner",
        "description": "從吃子、活棋到打劫，循序漸進建立棋感。",
        "age_range": "5–8 歲",
        "duration": "每堂 90 分鐘",
        "schedule": "週六 上午",
        "features": ["從零開始", "遊戲化教學", "小班制"],
        "order": 0,
    },
    {
        "slug": "advanced",
        "name": "進階班",
        "level": "advanced",
        "description": "佈局、定石與基本死活，培養全盤觀察力。",
        "age_range": "已會基本規則",
        "duration": "每堂 90 分鐘",
        "schedule": "週六 下午",
        "features": ["定石練習", "死活題庫", "對局講解"],
        "order": 1,
    },
    {
        "slug": "rank",
        "name": "段級班",
        "level": "rank",
        "description": "針對段級檢定與比賽訓練，專業棋譜分析。",
        "age_range": "1 級以上",
        "duration": "每堂 120 分鐘",
        "schedule": "週日 下午",
        "features": ["段級檢定衝刺", "比賽棋譜分析", "個別指導"],
        "order": 2,
    },
]

TEACHERS = [
    {
        "slug": "teacher-main",
        "name": "立光老師",
        "title": "創辦人 / 主教練",
        "rank": "業餘 6 段",
        "bio": "深耕兒童圍棋教學 5 年以上，學員多次於全國性段級檢定取得佳績。",
        "achievements": [
            "全國性圍棋大賽 30+ 獎項",
            "業餘 6 段認證",
            "兒童圍棋教學 5+ 年經驗",
        ],
        "order": 0,
    },
]

SETTINGS_DEFAULTS = {
    "site_name": "立光圍棋教室",
    "tagline": "讓每一步都更有想法",
    "hero_subtitle": "陪伴孩子在棋盤上培養專注、邏輯與勇氣。",
    "phone": "0952623567",
    "address": "台南市",
    "business_hours": "每日 9:00 – 21:00",
    "register_form_url": "",
    "register_form_note": "報名表整理中，敬請期待，或來電預約：0952623567。",
    "meta_description": "立光圍棋教室位於台南，提供 5–12 歲兒童圍棋啟蒙、進階、段級課程，小班制教學。",
    "meta_keywords": ["圍棋教室", "台南圍棋", "兒童圍棋", "圍棋課程", "立光圍棋"],
}


async def seed_cards() -> int:
    created = 0
    for data in CARDS:
        if await Card.find_one(Card.slug == data["slug"]):
            continue
        await Card(**data).insert()
        created += 1
    return created


async def seed_courses() -> int:
    created = 0
    for data in COURSES:
        if await Course.find_one(Course.slug == data["slug"]):
            continue
        await Course(**data).insert()
        created += 1
    return created


async def seed_teachers() -> int:
    created = 0
    for data in TEACHERS:
        if await Teacher.find_one(Teacher.slug == data["slug"]):
            continue
        await Teacher(**data).insert()
        created += 1
    return created


async def seed_settings() -> bool:
    existing = await SiteSettings.find_one(SiteSettings.key == GLOBAL_KEY)
    if existing:
        return False
    await SiteSettings(**SETTINGS_DEFAULTS).insert()
    return True


async def main() -> None:
    await init_db()
    try:
        c = await seed_cards()
        co = await seed_courses()
        t = await seed_teachers()
        s = await seed_settings()
        print(f"Seed done. cards:+{c} courses:+{co} teachers:+{t} settings:{'+1' if s else 'skip'}")
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
