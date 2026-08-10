import Image from "next/image";
import Link from "next/link";

import { Glyph, HoshiCluster, StoneTile, TILE_PATTERNS } from "@/components/public/glyph";
import { apiGet, resolveImageUrl } from "@/lib/api";
import type {
  Announcement,
  BlogPost,
  Card as CardData,
  Course,
  GalleryItem,
  SiteSettings,
  Teacher,
} from "@/lib/types";

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [hero, stats, ctaBottom, courses, teachers, gallery, blog, settings, announcements] =
    await Promise.all([
      safe(apiGet<CardData[]>("/api/v1/cards?page=home&section=hero"), []),
      safe(apiGet<CardData[]>("/api/v1/cards?page=home&section=stats"), []),
      safe(apiGet<CardData[]>("/api/v1/cards?page=home&section=cta"), []),
      safe(apiGet<Course[]>("/api/v1/courses"), [] as Course[]),
      safe(apiGet<Teacher[]>("/api/v1/teachers"), [] as Teacher[]),
      safe(apiGet<GalleryItem[]>("/api/v1/gallery"), [] as GalleryItem[]),
      safe(apiGet<BlogPost[]>("/api/v1/blog?published=true"), [] as BlogPost[]),
      safe(apiGet<SiteSettings | null>("/api/v1/settings", { revalidate: 300 }), null),
      safe(apiGet<Announcement[]>("/api/v1/announcements?limit=4"), [] as Announcement[]),
    ]);

  const heroCard = hero[0];
  const ctaCard = ctaBottom[0];
  const studentStat = stats.find((s) => /學生|位|人|\+/.test(s.title ?? ""));
  const latestPost = blog[0];

  // Hero 拼貼：抓 3 張教室照、若 gallery 抓不到就用內建 fallback 路徑
  const classroomPhotos = gallery
    .filter((g) => g.category === "classroom")
    .slice(0, 3);
  const heroPhotos =
    classroomPhotos.length >= 3
      ? classroomPhotos.map((g) => ({
          url: resolveImageUrl(g.image_url) ?? "",
          alt: g.title ?? "教室照",
        }))
      : [
          { url: "/uploads/2026/05/classroom-01.jpg", alt: "上課對局" },
          { url: "/uploads/2026/05/classroom-08.jpg", alt: "全班合照" },
          { url: "/uploads/2026/05/classroom-02.jpg", alt: "解題時間" },
        ].map((p) => ({ url: resolveImageUrl(p.url) ?? p.url, alt: p.alt }));

  // 比賽照（取前 4 張）— 用在 for-parents 用，本頁也可顯示一條
  const competitionPhotos = gallery
    .filter((g) => g.category === "competition")
    .slice(0, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-sun-300 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-coral-200 right-[-6rem] top-20" />
        <div className="blob h-72 w-72 bg-mint-200 left-1/3 -bottom-24" />

        <div className="container-page relative grid gap-10 py-14 md:grid-cols-12 md:gap-8 md:py-20">
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-200 px-4 py-1.5 text-sm font-bold text-mint-700 shadow-pop-sm">
              <span className="h-2 w-2 rounded-full bg-ink animate-bounce-soft" />
              <span className="h-2 w-2 rounded-full border border-ink/40 bg-white" />
              {settings?.tagline ?? "圍棋教室"}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-ink md:text-6xl">
              {heroCard?.title ?? "讓每一步"}
              <br />
              <span className="relative inline-block">
                <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-sun-300" />
                都更有想法
              </span>
            </h1>
            {(heroCard?.body || settings?.hero_subtitle) && (
              <p className="mt-5 max-w-xl text-lg text-ink-soft md:text-xl">
                {heroCard?.body ?? settings?.hero_subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={heroCard?.cta_url ?? "/register"}
                className="group inline-flex items-center gap-2 rounded-full bg-coral-500 px-7 py-3.5 font-display text-lg font-bold text-white shadow-pop-coral transition-transform hover:-rotate-1 hover:bg-coral-400 active:translate-y-1"
              >
                {heroCard?.cta_text ?? "免費試聽"}
                <Glyph name="arrow" className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/for-kids"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-7 py-3.5 font-display text-lg font-bold text-ink hover:rotate-1 hover:bg-sun-100"
              >
                <span className="h-3 w-3 rounded-full bg-ink" />
                我是小朋友
              </Link>
              <Link
                href="/for-parents"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-7 py-3.5 font-display text-lg font-bold text-ink hover:-rotate-1 hover:bg-mint-100"
              >
                <span className="h-3 w-3 rounded-full border-2 border-ink/60 bg-white" />
                我是家長
              </Link>
            </div>
          </div>

          {/* 右側：真實教室照拼貼 + 旋轉色塊貼紙 */}
          <div className="relative md:col-span-5">
            <div className="relative aspect-square w-full max-w-md mx-auto">
              {/* 主照片：大張、輕微右傾 */}
              <div className="absolute inset-0 rotate-2 overflow-hidden rounded-[2.25rem] bg-sun-300 p-2 shadow-pop-lg">
                <div className="relative h-full w-full overflow-hidden rounded-[1.85rem]">
                  <Image
                    src={heroPhotos[0].url}
                    alt={heroPhotos[0].alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 28rem"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* 第 2 張：左下角，反向旋轉、較小 */}
              <div className="absolute -bottom-6 -left-6 h-40 w-32 -rotate-6 overflow-hidden rounded-[1.5rem] bg-mint-300 p-1.5 shadow-pop animate-sway sm:h-48 sm:w-40">
                <div className="relative h-full w-full overflow-hidden rounded-[1.15rem]">
                  <Image
                    src={heroPhotos[1].url}
                    alt={heroPhotos[1].alt}
                    fill
                    sizes="10rem"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* 第 3 張：右上角，再小、旋轉 */}
              <div className="absolute -right-4 -top-4 h-32 w-32 rotate-6 overflow-hidden rounded-[1.5rem] bg-coral-300 p-1.5 shadow-pop animate-float sm:h-36 sm:w-36">
                <div className="relative h-full w-full overflow-hidden rounded-[1.15rem]">
                  <Image
                    src={heroPhotos[2].url}
                    alt={heroPhotos[2].alt}
                    fill
                    sizes="9rem"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* 一張迷你棋盤貼紙當點綴 */}
              <span className="absolute right-6 bottom-8 grid h-14 w-14 -rotate-12 place-items-center rounded-2xl bg-cream-100 shadow-pop animate-bounce-soft">
                <StoneTile pattern={TILE_PATTERNS.enclose} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 公告 Band（有公告才顯示） ─────────────────── */}
      {announcements.length > 0 && (
        <section className="container-page pb-6">
          <div className="rounded-[1.75rem] border-2 border-coral-200 bg-white p-5 shadow-pop-sm md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-grid h-8 w-8 -rotate-6 place-items-center rounded-lg bg-coral-500 text-[10px] font-bold tracking-wider text-white shadow-pop-sm">
                  NEW
                </span>
                <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
                  最新公告
                </h2>
              </div>
              <Link
                href="/announcements"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-coral-700 hover:text-coral-600"
              >
                查看全部 <Glyph name="arrow" size={14} />
              </Link>
            </div>

            <ul className="mt-4 divide-y-2 divide-cream-100">
              {announcements.slice(0, 3).map((a) => {
                const date = a.published_at ? new Date(a.published_at) : null;
                const dateStr = date
                  ? `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
                  : "";
                const tagColors: Record<string, string> = {
                  招生: "bg-coral-200 text-coral-800",
                  比賽: "bg-sun-200 text-sun-900",
                  停課: "bg-grape-200 text-grape-600",
                  活動: "bg-mint-200 text-mint-800",
                  公告: "bg-sky2-200 text-sky2-700",
                };
                const tagCls = a.tag ? tagColors[a.tag] ?? "bg-cream-200 text-ink-soft" : null;
                const inner = (
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                    {dateStr && (
                      <span className="w-12 font-mono text-xs text-ink-soft">
                        {dateStr}
                      </span>
                    )}
                    {a.pinned && (
                      <span className="inline-grid h-5 w-7 -rotate-6 place-items-center rounded-md bg-coral-500 text-[10px] font-bold text-white">
                        PIN
                      </span>
                    )}
                    {a.tag && tagCls && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tagCls}`}>
                        {a.tag}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate font-bold text-ink">
                      {a.title}
                    </span>
                  </div>
                );
                return (
                  <li key={a.id}>
                    {a.link_url ? (
                      <Link href={a.link_url} className="block hover:bg-cream-50">
                        {inner}
                      </Link>
                    ) : (
                      <Link href="/announcements" className="block hover:bg-cream-50">
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ── Bento 9 宮格 ─────────────────────────────── */}
      <section className="container-page pb-10">
        <div className="mb-8 flex items-center gap-3">
          <HoshiCluster className="h-9 w-9 -rotate-6" />
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            一眼看完立光
          </h2>
          <span className="rounded-full bg-coral-100 px-3 py-1 text-xs font-bold tracking-wider text-coral-700">
            OVERVIEW
          </span>
        </div>

        <div className="bento">
          {/* 1. 課程（大格 / sun） */}
          <Link
            href="/courses"
            className="group bento-cell bento-cell-hover col-span-2 bg-sun-200 md:col-span-7 md:row-span-2"
          >
            <div className="dot-grid absolute inset-0 -z-0 opacity-50" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wider text-ink">
                    OUR COURSES
                  </span>
                  <h3 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
                    依程度分班<br />
                    從零開始到段級
                  </h3>
                </div>
                <span className="hidden h-16 w-16 -rotate-6 grid-cols-3 gap-1 md:grid">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-4 w-4 rounded-full ${
                        i === 4 ? "bg-coral-500" : "bg-ink/15"
                      }`}
                    />
                  ))}
                </span>
              </div>

              <div className="mt-6 grid flex-1 gap-3 sm:grid-cols-3">
                {(courses.length > 0
                  ? courses
                  : [
                      { id: "a", slug: "", name: "啟蒙班", age_range: "5–7 歲", level: "", description: null, duration: null, schedule: null, price: null, image_url: null, features: [], order: 0, visible: true, created_at: "", updated_at: "" } as Course,
                      { id: "b", slug: "", name: "進階班", age_range: "8–10 歲", level: "", description: null, duration: null, schedule: null, price: null, image_url: null, features: [], order: 0, visible: true, created_at: "", updated_at: "" } as Course,
                      { id: "c", slug: "", name: "段位班", age_range: "11+ 歲", level: "", description: null, duration: null, schedule: null, price: null, image_url: null, features: [], order: 0, visible: true, created_at: "", updated_at: "" } as Course,
                    ]
                )
                  .slice(0, 3)
                  .map((c, idx) => {
                    const patterns = [TILE_PATTERNS.line, TILE_PATTERNS.knight, TILE_PATTERNS.shape];
                    const tones = ["bg-coral-100", "bg-mint-100", "bg-grape-100"];
                    return (
                      <div
                        key={c.id}
                        className={`relative rounded-2xl border-2 border-ink/10 bg-white/95 p-4 transition-transform hover:-translate-y-1 ${
                          idx === 0 ? "rotate-[-1deg]" : idx === 1 ? "rotate-1" : "rotate-[-0.5deg]"
                        }`}
                      >
                        <span className={`inline-grid h-10 w-10 -rotate-6 place-items-center rounded-xl ${tones[idx]} shadow-pop-sm`}>
                          <StoneTile pattern={patterns[idx]} />
                        </span>
                        <h4 className="mt-3 font-display text-lg font-bold text-ink">
                          {c.name}
                        </h4>
                        <p className="mt-0.5 text-xs font-bold text-coral-600">
                          {c.age_range ?? c.level}
                        </p>
                      </div>
                    );
                  })}
              </div>

              <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream-100 group-hover:bg-ink/90">
                看全部課程
                <Glyph name="arrow" size={14} />
              </span>
            </div>
          </Link>

          {/* 2. 學生人數（coral） */}
          <div className="bento-cell col-span-1 bg-coral-200 md:col-span-5">
            <span className="absolute -right-4 -top-4 inline-block h-24 w-24 rounded-full bg-coral-300/60 blur-2xl" />
            <span className="relative inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wider text-coral-700">
              ACCUMULATED
            </span>
            <div className="relative mt-3 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-ink md:text-6xl">
                {studentStat?.title ?? "100+"}
              </span>
              <span className="text-lg font-bold text-ink-soft">位小棋士</span>
            </div>
            <p className="relative mt-2 text-sm text-ink-soft">
              {studentStat?.subtitle ?? "從幼兒園到國中都在學棋"}
            </p>
            {/* 角落散落小棋子當裝飾 */}
            <span className="absolute bottom-4 right-6 grid grid-cols-4 gap-1.5">
              {[0, 1, 0, 1, 1, 0, 1, 0].map((c, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${c ? "bg-ink" : "border border-ink/40 bg-white"}`}
                />
              ))}
            </span>
          </div>

          {/* 3. 師資（mint）— 顯示主教練資訊 */}
          <Link
            href="/teachers"
            className="bento-cell bento-cell-hover col-span-1 bg-mint-200 md:col-span-5"
          >
            <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wider text-mint-800">
              HEAD TEACHER
            </span>
            {(() => {
              const lead = teachers[0];
              if (!lead) {
                return (
                  <>
                    <h3 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">
                      專業且耐心
                    </h3>
                    <p className="mt-3 text-sm text-mint-800">尚未設定主教練資料</p>
                  </>
                );
              }
              const avatar = resolveImageUrl(lead.avatar_url);
              return (
                <div className="mt-4 flex items-start gap-4">
                  <span className="relative grid h-20 w-20 shrink-0 -rotate-3 place-items-center overflow-hidden rounded-2xl bg-white shadow-pop-sm sm:h-24 sm:w-24">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={lead.name}
                        fill
                        sizes="6rem"
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-display text-3xl font-bold text-ink">
                        {lead.name.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl font-bold text-ink md:text-2xl">
                      {lead.name}
                    </p>
                    {lead.title && (
                      <p className="mt-0.5 text-xs font-bold text-mint-800">
                        {lead.title}
                      </p>
                    )}
                    {lead.rank && (
                      <p className="mt-2 inline-block rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold text-coral-700">
                        {lead.rank}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-mint-700">
              認識更多 <Glyph name="arrow" size={14} />
            </p>
          </Link>

          {/* 4. 相簿（sky） */}
          <Link
            href="/gallery"
            className="bento-cell bento-cell-hover col-span-1 bg-sky2-200 md:col-span-4"
          >
            <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wider text-sky2-700">
              GALLERY
            </span>
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {(gallery.length > 0 ? gallery.slice(0, 9) : Array.from({ length: 9 })).map(
                (g, i) => {
                  const item = (g as GalleryItem) ?? null;
                  const url = item?.image_url ? resolveImageUrl(item.image_url) : null;
                  return (
                    <span
                      key={item?.id ?? i}
                      className="aspect-square overflow-hidden rounded-lg bg-white/70 ring-2 ring-white"
                      style={
                        url
                          ? {
                              backgroundImage: `url(${url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                  );
                },
              )}
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-sky2-700">
              看更多照片 <Glyph name="arrow" size={14} />
            </p>
          </Link>

          {/* 5. 部落格（white） */}
          <Link
            href={latestPost ? `/blog/${latestPost.slug}` : "/blog"}
            className="bento-cell bento-cell-hover col-span-1 bg-white md:col-span-4"
          >
            <span className="inline-block rounded-full bg-cream-200 px-3 py-1 text-xs font-bold tracking-wider text-ink">
              LATEST
            </span>
            <h4 className="mt-3 font-display text-xl font-bold text-ink line-clamp-2">
              {latestPost?.title ?? "棋盤上的第一堂課，學的不是輸贏"}
            </h4>
            <p className="mt-2 text-sm text-ink-soft line-clamp-3">
              {latestPost?.excerpt ??
                "陪伴孩子在每一手棋裡，慢慢長出耐心、勇氣與好玩的心。"}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-coral-600">
              讀文章 <Glyph name="arrow" size={14} />
            </p>
          </Link>

          {/* 6. 地點（cream） */}
          <Link
            href="/location"
            className="bento-cell bento-cell-hover col-span-1 bg-cream-100 md:col-span-4"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-200 px-3 py-1 text-xs font-bold tracking-wider text-ink">
              <Glyph name="pin" size={12} /> LOCATION
            </span>
            <h4 className="mt-3 font-display text-lg font-bold text-ink">
              {settings?.address ?? "教室位置"}
            </h4>
            {settings?.business_hours && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <Glyph name="clock" size={14} /> {settings.business_hours}
              </p>
            )}
            {settings?.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <Glyph name="phone" size={14} /> {settings.phone}
              </p>
            )}
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-mint-700">
              看地圖 <Glyph name="arrow" size={14} />
            </p>
          </Link>

          {/* 7. 報名 CTA（大格 / ink） */}
          <Link
            href="/register"
            className="group bento-cell bento-cell-hover col-span-2 bg-ink text-cream-100 md:col-span-7"
          >
            <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sun-400/30 blur-2xl" />
            <span className="absolute right-6 top-6 inline-block rotate-12 rounded-full bg-sun-400 px-3 py-1 text-xs font-bold tracking-wider text-ink">
              FREE
            </span>
            <span className="relative inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-sun-300">
              TRY A LESSON
            </span>
            <h3 className="relative mt-3 font-display text-3xl font-bold text-cream-100 md:text-4xl">
              {ctaCard?.title ?? "幫孩子開啟下棋的第一步"}
            </h3>
            <p className="relative mt-3 max-w-md text-cream-100/80">
              {ctaCard?.subtitle ?? "免費試聽 60 分鐘，第一次不收費也不推銷。"}
            </p>
            <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 font-display font-bold text-white shadow-pop-coral group-hover:bg-coral-400">
              {ctaCard?.cta_text ?? "立即報名"}
              <Glyph name="arrow" />
            </span>
          </Link>

          {/* 8. FAQ（sun-100） */}
          <Link
            href="/for-parents#faq"
            className="bento-cell bento-cell-hover col-span-1 bg-sun-100 md:col-span-5"
          >
            <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wider text-ink">
              ASKED BY PARENTS
            </span>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                "幾歲可以開始？",
                "完全不會也可以嗎？",
                "學費怎麼算？",
              ].map((q, i) => (
                <li
                  key={q}
                  className="flex items-start gap-3 rounded-xl bg-white/70 p-2.5"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-coral-200 font-display text-xs font-bold text-coral-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-bold text-ink">{q}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-coral-700">
              看更多解答 <Glyph name="arrow" size={14} />
            </p>
          </Link>
        </div>
      </section>

      {/* ── 雙主角入口：給小朋友 / 給家長 ──────────────── */}
      <section className="container-page py-12">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/for-kids"
            className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-grape-200 via-coral-100 to-sun-200 p-8 shadow-pop transition-transform hover:-translate-y-1 hover:-rotate-1 md:p-10"
          >
            <span className="absolute right-8 top-8 grid h-20 w-20 rotate-6 place-items-center rounded-3xl bg-white/80 shadow-pop-sm animate-float">
              <StoneTile pattern={TILE_PATTERNS.scatter} />
            </span>
            <span className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-coral-300/30 blur-2xl" />
            <p className="font-display text-sm font-bold tracking-wider text-coral-700">
              FOR KIDS
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
              來玩個<br />超有趣的遊戲
            </h3>
            <p className="mt-3 max-w-sm text-ink-soft">
              黑白小子打架、吃豆豆、蓋城堡，學圍棋其實一點都不無聊！
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream-100 group-hover:bg-ink/90">
              我要去看看 <Glyph name="arrow" size={14} />
            </span>
          </Link>

          <Link
            href="/for-parents"
            className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-mint-200 via-sky2-100 to-cream-100 p-8 shadow-pop transition-transform hover:-translate-y-1 hover:rotate-1 md:p-10"
          >
            <span className="absolute right-8 top-8 grid h-20 w-20 -rotate-6 place-items-center rounded-3xl bg-white/80 shadow-pop-sm animate-sway">
              <StoneTile pattern={TILE_PATTERNS.enclose} />
            </span>
            <span className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-mint-300/30 blur-2xl" />
            <p className="font-display text-sm font-bold tracking-wider text-mint-700">
              FOR PARENTS
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
              為什麼<br />選擇圍棋？
            </h3>
            <p className="mt-3 max-w-sm text-ink-soft">
              專注力、邏輯思考、情緒管理 — 一份給家長的完整說明。
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream-100 group-hover:bg-ink/90">
              了解更多 <Glyph name="arrow" size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* 底部 padding 給 footer 上方浮卡留空間 */}
      <div className="h-32" />
    </>
  );
}
