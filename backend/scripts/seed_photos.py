"""把已上傳到 /app/uploads/2026/05/ 的 20 張照片寫入 gallery_items，
並設定 teacher 主教練的 avatar_url。可重複執行（依 image_url 去重）。

使用方式（在 backend/ 資料夾下，或於 docker compose exec backend 內）：
    python -m scripts.seed_photos
"""
import asyncio

from app.core.database import close_db, init_db
from app.models.gallery_item import GalleryItem
from app.models.teacher import Teacher

BASE = "/uploads/2026/05"

# ── 教室照（9 張）─────────────────────────────────────
CLASSROOM = [
    ("classroom-01.jpg", "上課對局中", "孩子們在大棋盤前對局，老師隨時在旁觀察。"),
    ("classroom-02.jpg", "靜心算氣", "全班專注解題，培養計算與耐心。"),
    ("classroom-03.jpg", "復盤討論", "比賽棋譜現場研究，自己找下一步可以更好的地方。"),
    ("classroom-04-trip.jpg", "出隊集合", "參賽前集合，一起搭高鐵北上拼戰。"),
    ("classroom-05.jpg", "教學示範", "老師在示範棋盤上講解經典定石。"),
    ("classroom-06-empty.jpg", "教室一角", "明亮整潔的教室，新桌椅、新棋具。"),
    ("classroom-07-empty.jpg", "對局教室", "獨立的對局區，能容納多桌同時對局。"),
    ("classroom-08.jpg", "歡樂時光", "全員到齊的某個午後，孩子們笑容滿溢。"),
    ("classroom-09-night.jpg", "夜間實戰課", "投影講解 + 實戰，進階班週間的固定行程。"),
]

# ── 比賽照（11 張）────────────────────────────────────
COMP = [
    ("comp-2025-junjie-01.jpg", "俊傑盃 領獎合影", "2025 第二十二屆俊傑盃全國圍棋公開賽。"),
    ("comp-2025-luermen-01.jpg", "鹿耳門盃 獎盃留念", "2025 第十一屆鹿耳門媽祖盃全國圍棋公開賽，獲季軍。"),
    ("comp-2025-luermen-02.jpg", "鹿耳門盃 頒獎台", "多位學員一起上台領獎。"),
    ("comp-2026-tnsports-01.jpg", "臺南體育盃 個人領獎", "2026 台南市第二屆體育盃全國圍棋錦標賽。"),
    ("comp-2026-tnsports-02-teacher.jpg", "臺南體育盃 師生合影", "蘇治灝老師與獲獎學員合影。"),
    ("comp-2026-dizang-01.jpg", "嘉義地藏王盃 雙人歡呼", "兩位學員一起拿下季軍，笑得超燦爛。"),
    ("comp-2026-dagou-01.jpg", "打狗盃 師生合影", "2026 第十五屆高雄打狗盃全國圍棋錦標賽。"),
    ("comp-2026-dagou-02.jpg", "打狗盃 季軍領獎", "陳同學拿下丁組季軍。"),
    ("comp-2026-dagou-03.jpg", "打狗盃 亞軍領獎", "陳同學拿下丁組亞軍。"),
    ("comp-2026-dagou-04.jpg", "打狗盃 老師與雙獎得主", "老師與兩位學員一起站上頒獎台。"),
    ("comp-2026-dagou-05.jpg", "打狗盃 賽後留念", "戶外場景，獎盃與獎狀。"),
]


async def seed_gallery() -> int:
    """以 image_url 為唯一鍵，重複跑不會重複塞。"""
    created = 0
    for order, (fname, title, desc) in enumerate(CLASSROOM):
        url = f"{BASE}/{fname}"
        if await GalleryItem.find_one(GalleryItem.image_url == url):
            continue
        await GalleryItem(
            title=title,
            description=desc,
            image_url=url,
            category="classroom",
            order=order,
        ).insert()
        created += 1

    for order, (fname, title, desc) in enumerate(COMP):
        url = f"{BASE}/{fname}"
        if await GalleryItem.find_one(GalleryItem.image_url == url):
            continue
        await GalleryItem(
            title=title,
            description=desc,
            image_url=url,
            category="competition",
            order=100 + order,  # 比賽排在教室照之後
        ).insert()
        created += 1
    return created


async def set_teacher_avatar() -> bool:
    """把現有的「立光老師 / teacher-main」設定 avatar 為臺南體育盃師生合影。"""
    teacher = await Teacher.find_one(Teacher.slug == "teacher-main")
    if teacher is None:
        return False
    teacher.avatar_url = f"{BASE}/comp-2026-tnsports-02-teacher.jpg"
    if not teacher.name or teacher.name == "立光老師":
        teacher.name = "蘇治灝"
    if not teacher.title:
        teacher.title = "創辦人 / 主教練"
    await teacher.save()
    return True


async def main() -> None:
    await init_db()
    try:
        n = await seed_gallery()
        avatar_set = await set_teacher_avatar()
        print(f"Seed photos done. gallery:+{n} teacher_avatar:{'set' if avatar_set else 'skip'}")
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
