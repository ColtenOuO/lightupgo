"""把主教練資料更新成「鄭立友」。

之前 seed 的版本叫「立光老師 / 蘇治灝」是錯的（蘇治灝是協會理事長，不是教師）。
本腳本：
1. 找到 slug="teacher-main"（舊種子）或 slug="teacher-zheng-li-you"（新）
2. 用下面這份完整資料覆寫
3. 安全重跑（idempotent）

執行：
    docker compose exec backend python -m scripts.seed_teacher
"""
import asyncio

from app.core.database import close_db, init_db
from app.models.teacher import Teacher

SLUG = "teacher-zheng-li-you"
OLD_SLUG = "teacher-main"

TEACHER_DATA = {
    "slug": SLUG,
    "name": "鄭立友",
    "title": "創辦人 / 主教練",
    "rank": "業餘 7 段 · 野狐 9 段",
    "bio": (
        "成功大學測量空間學系畢業，台灣業餘排名第 38 名。\n"
        "深耕兒童與青少年圍棋教學多年，相信「簡單快樂的教學，能讓學生真正感受圍棋的樂趣」，"
        "強調引導思考、從失敗中成長，以及自我檢討的能力。"
    ),
    # 主要 avatar 留空，老師到後台自己上傳會比較準（之前自動套用的 tnsports 比賽照其實是別人）。
    "avatar_url": None,
    # 簡短戰績清單，前台「師資」Bento 卡 / 列表頁的條列。
    "achievements": [
        "業餘 7 段（台灣業餘排名第 38 名）",
        "野狐網路圍棋 9 段",
        "2025 小應氏盃團體賽 決賽",
        "2024 今廈才智盃 冠軍",
        "2024 陽明山邀請賽 冠軍",
        "2023 雲林縣長盃 冠軍",
        "成功大學圍棋社 第 26 屆社長 (2021–2022)",
    ],
    "extras": {
        "online_rank": "野狐網路圍棋 9 段",
        "taiwan_amateur_ranking": 38,
        "education": {
            "university": "國立成功大學",
            "department": "測量及空間資訊學系",
        },
        "contact": {
            "facebook": "鄭立友",
        },
        "teaching_philosophy": [
            "簡單快樂的教學，讓學生感受圍棋的樂趣，並以積極的態度支持每位學生，幫助他們建立自信心與對圍棋的熱愛。",
            "鼓勵學生主動思考和提出問題，不是直接給答案，而是引導他們獨立解決。",
            "從失敗中成長，強調堅韌的重要性，並培養自我檢討和修正的能力。",
        ],
        "teaching_experience": [
            {"year": "2025–", "organization": "立光圍棋教室", "role": "創辦"},
            {"year": "2023–2024", "organization": "臺南市私立崇明中學", "role": "圍棋指導教師"},
            {"year": "2023–2024", "organization": "成大附屬臺南高級工業職業學校", "role": "圍棋專任老師"},
            {"year": "2021–2023", "organization": "成大實驗小學", "role": "圍棋老師"},
            {"year": "2021–2023", "organization": "成功大學圍棋社", "role": "教學"},
            {"year": "2020–2024", "organization": "台南圍棋教室（棋飛圍棋）", "role": "教師"},
            {"year": "2020–2024", "organization": "個人家教", "role": "一對一"},
            {"year": "2015–2017", "organization": "台北市大安國中圍棋班", "role": "結業"},
        ],
        "competition_awards": [
            {
                "year": "2025",
                "note": "海外比賽 + 國內比賽",
                "awards": ["小應氏盃團體賽 決賽", "青春夢媽祖盃交流賽 亞軍"],
            },
            {
                "year": "2024",
                "note": "海外比賽",
                "awards": ["今廈才智盃 冠軍", "陽明山邀請賽 冠軍"],
            },
            {
                "year": "2023",
                "awards": ["雲林縣長盃 冠軍", "台灣聯合圍棋錦標賽 第三名"],
            },
            {
                "year": "2022",
                "awards": ["高雄體育盃 第四名", "全國大學生圍棋賽個人組 第三名"],
            },
        ],
        "other_experience": [
            {"year": 2022, "event": "雙城盃圍棋交流賽"},
            {"year": 2021, "event": "台大成大交流賽"},
            {"year": "2021–2022", "event": "成功大學圍棋社", "role": "社長"},
            {"year": 2015, "event": "韓國交流賽"},
        ],
    },
    "order": 0,
    "visible": True,
}


async def main() -> None:
    await init_db()
    try:
        # 1. 刪掉舊的 teacher-main（如果還在），避免重複
        old = await Teacher.find_one(Teacher.slug == OLD_SLUG)
        if old and old.slug != SLUG:
            print(f"删除舊 teacher：slug={OLD_SLUG} (id={old.id})")
            await old.delete()

        # 2. upsert 鄭立友
        existing = await Teacher.find_one(Teacher.slug == SLUG)
        if existing:
            for k, v in TEACHER_DATA.items():
                setattr(existing, k, v)
            await existing.save()
            print(f"已更新 {TEACHER_DATA['name']}（{SLUG}）")
        else:
            await Teacher(**TEACHER_DATA).insert()
            print(f"已建立 {TEACHER_DATA['name']}（{SLUG}）")
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
