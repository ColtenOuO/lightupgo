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
        "body": "免費試聽 60 分鐘，第一次不收費也不推銷。",
        "cta_text": "立即報名",
        "cta_url": "/register",
        "icon": "sparkles",
    },
    # ── For Kids · 4 個遊戲玩法 ──────────────
    # icon 欄位填入 StoneTile 圖樣 key（black/white/pair/enclose/twin/scatter/
    # hoshi/line/jump/knight/sansan/shape），前台會自動轉成迷你棋盤圖示。
    {
        "slug": "fk_game_fight",
        "page": "for_kids",
        "section": "games",
        "order": 0,
        "title": "黑白小子打架",
        "body": "把對方的小子圍住，就可以把它「吃」掉。看誰先圍到！",
        "icon": "enclose",
    },
    {
        "slug": "fk_game_castle",
        "page": "for_kids",
        "section": "games",
        "order": 1,
        "title": "蓋自己的城堡",
        "body": "圍出愈大的地盤，就贏愈多分！像在地圖上畫自己的領土。",
        "icon": "shape",
    },
    {
        "slug": "fk_game_detective",
        "page": "for_kids",
        "section": "games",
        "order": 2,
        "title": "想三步棋的偵探",
        "body": "猜對手下一步要去哪，再決定自己要下哪 — 變成厲害的偵探！",
        "icon": "knight",
    },
    {
        "slug": "fk_game_levelup",
        "page": "for_kids",
        "section": "games",
        "order": 3,
        "title": "升級打怪",
        "body": "20 級 → 1 級 → 段位！每一階都有不同的挑戰跟獎牌。",
        "icon": "jump",
    },
    # ── For Kids · 你可以拿到 ─────────────
    {
        "slug": "fk_reward_sticker",
        "page": "for_kids",
        "section": "rewards",
        "order": 0,
        "title": "每次上課有貼紙",
        "icon": "black",
    },
    {
        "slug": "fk_reward_medal",
        "page": "for_kids",
        "section": "rewards",
        "order": 1,
        "title": "升級拿小獎章",
        "icon": "hoshi",
    },
    {
        "slug": "fk_reward_challenge",
        "page": "for_kids",
        "section": "rewards",
        "order": 2,
        "title": "贏老師可以挑戰新關卡",
        "icon": "twin",
    },
    {
        "slug": "fk_reward_friend",
        "page": "for_kids",
        "section": "rewards",
        "order": 3,
        "title": "認識愛下棋的好朋友",
        "icon": "pair",
    },
    # ── For Kids · 上課流程 ───────────────
    {
        "slug": "fk_flow_warmup",
        "page": "for_kids",
        "section": "flow",
        "order": 0,
        "title": "暖身小遊戲",
        "body": "今天先抓死活、找氣，30 秒題目搶答！",
    },
    {
        "slug": "fk_flow_play",
        "page": "for_kids",
        "section": "flow",
        "order": 1,
        "title": "和朋友下一盤",
        "body": "找一個程度差不多的同學對局，老師在旁邊看。",
    },
    {
        "slug": "fk_flow_review",
        "page": "for_kids",
        "section": "flow",
        "order": 2,
        "title": "老師講解 + 拿貼紙",
        "body": "今天進步在哪？老師會貼一張勳章貼紙在你的小手冊。",
    },
    # ── For Parents · Hero 旁邊數字 ─────────
    {
        "slug": "fp_stat_years",
        "page": "for_parents",
        "section": "stats",
        "order": 0,
        "title": "10+",
        "subtitle": "年教學經驗",
    },
    {
        "slug": "fp_stat_students",
        "page": "for_parents",
        "section": "stats",
        "order": 1,
        "title": "100+",
        "subtitle": "位累積學員",
    },
    {
        "slug": "fp_stat_class",
        "page": "for_parents",
        "section": "stats",
        "order": 2,
        "title": "4–6",
        "subtitle": "人小班制",
    },
    {
        "slug": "fp_stat_review",
        "page": "for_parents",
        "section": "stats",
        "order": 3,
        "title": "1:1",
        "subtitle": "個別復盤",
    },
    # ── For Parents · 六大效益 ────────────
    {
        "slug": "fp_benefit_focus",
        "page": "for_parents",
        "section": "benefits",
        "order": 0,
        "title": "專注力",
        "body": "一盤棋平均 30–60 分鐘，孩子要持續觀察、計算，是少數能讓他們「自願坐住」的活動。",
        "icon": "hoshi",
    },
    {
        "slug": "fp_benefit_logic",
        "page": "for_parents",
        "section": "benefits",
        "order": 1,
        "title": "邏輯思考",
        "body": "每一手都需要預想三步以上：對方會怎麼回？我又該怎麼接？大腦在不知不覺中變強壯。",
        "icon": "knight",
    },
    {
        "slug": "fp_benefit_stress",
        "page": "for_parents",
        "section": "benefits",
        "order": 2,
        "title": "抗壓 / 情緒",
        "body": "圍棋一定會輸，輸完還要復盤。孩子練習面對挫折、找原因、再來一次 — 不是哭就好。",
        "icon": "enclose",
    },
    {
        "slug": "fp_benefit_social",
        "page": "for_parents",
        "section": "benefits",
        "order": 3,
        "title": "社交禮儀",
        "body": "「請多指教」「謝謝指教」每一局都會說。和不同年齡的對手互動，自然長出社交感。",
        "icon": "pair",
    },
    {
        "slug": "fp_benefit_math",
        "page": "for_parents",
        "section": "benefits",
        "order": 4,
        "title": "空間感 / 數學",
        "body": "棋盤就是一個 19×19 的數學世界，孩子在算地的過程中，培養加減乘除的直覺。",
        "icon": "shape",
    },
    {
        "slug": "fp_benefit_culture",
        "page": "for_parents",
        "section": "benefits",
        "order": 5,
        "title": "中文 / 文化",
        "body": "對局用語、棋譜閱讀，自然延伸到中文閱讀理解，也接上 4000 年的東方文化脈絡。",
        "icon": "sansan",
    },
    # ── For Parents · 家長的擔心 → 我們怎麼處理 ─
    {
        "slug": "fp_worry_sit",
        "page": "for_parents",
        "section": "worries",
        "order": 0,
        "title": "孩子坐不住，會不會學沒幾節就放棄？",
        "body": "前三堂我們刻意把節奏切碎：暖身小遊戲 → 短局 → 老師講解，每段不超過 15 分鐘。",
    },
    {
        "slug": "fp_worry_parent",
        "page": "for_parents",
        "section": "worries",
        "order": 1,
        "title": "我自己不會下棋，沒辦法教他。",
        "body": "完全沒問題！我們會每月給家長一份「進度小報」，告訴你孩子在學什麼、可以問他哪些問題。",
    },
    {
        "slug": "fp_worry_lose",
        "page": "for_parents",
        "section": "worries",
        "order": 2,
        "title": "輸了會不會大哭、玻璃心？",
        "body": "前期老師會主動配對程度相近的同學，並引導「復盤」的習慣：找一個今天做得好的地方、一個下次可改的地方。",
    },
    {
        "slug": "fp_worry_homework",
        "page": "for_parents",
        "section": "worries",
        "order": 3,
        "title": "會不會跟學校功課衝突？",
        "body": "我們不要求在家練習。一週 90 分鐘的課程，就足夠維持進步；段位班的孩子才會建議多花時間。",
    },
    # ── For Parents · FAQ ────────────────
    {
        "slug": "fp_faq_zero",
        "page": "for_parents",
        "section": "faq",
        "order": 0,
        "title": "我的孩子完全不會下棋，可以嗎？",
        "body": "可以！我們有「啟蒙班」就是給完全沒接觸過的孩子，從拿棋子、認識黑白開始，前三節都是玩遊戲，不會壓力很大。",
    },
    {
        "slug": "fp_faq_age",
        "page": "for_parents",
        "section": "faq",
        "order": 1,
        "title": "幾歲開始學最適合？",
        "body": "5 歲（大班）以上都可以。最早的學員 4 歲半開始；如果孩子可以坐住 20 分鐘、會數 1–20，就可以來試聽看看。",
    },
    {
        "slug": "fp_faq_freq",
        "page": "for_parents",
        "section": "faq",
        "order": 2,
        "title": "一週要上幾次？要練多久？",
        "body": "一般建議每週 1 次（90 分鐘），平日 / 假日都有班。在家不一定要練，但如果孩子有興趣，我們會推薦免費的對局 App。",
    },
    {
        "slug": "fp_faq_fee",
        "page": "for_parents",
        "section": "faq",
        "order": 3,
        "title": "學費怎麼算？有沒有試聽費？",
        "body": "第一節「免費試聽」完全不收費，也不會推銷。試聽後如果決定加入，我們會依照孩子的程度安排合適的班別，學費以期報名。",
    },
    {
        "slug": "fp_faq_shy",
        "page": "for_parents",
        "section": "faq",
        "order": 4,
        "title": "孩子個性比較內向，會不會被欺負？",
        "body": "圍棋班通常都是 4–8 人小班，老師會配對程度相近的同學對局。內向的孩子在棋盤上反而很有優勢 — 安靜、會觀察。",
    },
    {
        "slug": "fp_faq_compare",
        "page": "for_parents",
        "section": "faq",
        "order": 5,
        "title": "和心算 / 程式 / 數學課比，差別是？",
        "body": "圍棋同時練「右腦的圖像感」與「左腦的計算」，更接近真實生活的決策練習：資訊不完整、有對手、要承擔結果。",
    },
    # ── Register · 4 步驟 ────────────────
    {
        "slug": "reg_step_form",
        "page": "register",
        "section": "steps",
        "order": 0,
        "title": "填表單",
        "body": "5 分鐘填完，告訴我們孩子幾歲、有沒有經驗。",
    },
    {
        "slug": "reg_step_contact",
        "page": "register",
        "section": "steps",
        "order": 1,
        "title": "我們聯絡你",
        "body": "1–2 個工作天內回電，安排合適的試聽時段。",
    },
    {
        "slug": "reg_step_try",
        "page": "register",
        "section": "steps",
        "order": 2,
        "title": "來試聽 60 分鐘",
        "body": "完全免費，孩子會玩到三個小遊戲。",
    },
    {
        "slug": "reg_step_decide",
        "page": "register",
        "section": "steps",
        "order": 3,
        "title": "決定要不要加入",
        "body": "我們不推銷，當天不會有「現在報名打折」這種話。",
    },
    # ── Register · 信任徽章 ─────────────
    {
        "slug": "reg_trust_free",
        "page": "register",
        "section": "trust",
        "order": 0,
        "title": "100% 免費",
        "icon": "black",
    },
    {
        "slug": "reg_trust_no_push",
        "page": "register",
        "section": "trust",
        "order": 1,
        "title": "不推銷",
        "icon": "white",
    },
    {
        "slug": "reg_trust_privacy",
        "page": "register",
        "section": "trust",
        "order": 2,
        "title": "資料保密",
        "icon": "enclose",
    },
    {
        "slug": "reg_trust_age",
        "page": "register",
        "section": "trust",
        "order": 3,
        "title": "5 歲起可參加",
        "icon": "pair",
    },
    # ── Register · 報名前快速 FAQ ────────
    {
        "slug": "reg_qfaq_tools",
        "page": "register",
        "section": "quick_faq",
        "order": 0,
        "title": "需要自己帶棋具嗎？",
        "body": "完全不用，現場全部準備好。",
    },
    {
        "slug": "reg_qfaq_accompany",
        "page": "register",
        "section": "quick_faq",
        "order": 1,
        "title": "可以家長陪同嗎？",
        "body": "歡迎，會安排家長休息區，看得到孩子但不會打擾上課。",
    },
    {
        "slug": "reg_qfaq_decide",
        "page": "register",
        "section": "quick_faq",
        "order": 2,
        "title": "試聽結束需要當場決定嗎？",
        "body": "不用，回家想一想沒問題，名額會幫你保留 3 天。",
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
