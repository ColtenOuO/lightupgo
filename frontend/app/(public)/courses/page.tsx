import Link from "next/link";

import { Glyph, HoshiCluster, StoneTile, TILE_PATTERNS } from "@/components/public/glyph";
import { apiGet } from "@/lib/api";
import type { Course } from "@/lib/types";

export const metadata = {
  title: "課程",
};

async function getCourses(): Promise<Course[]> {
  try {
    return await apiGet<Course[]>("/api/v1/courses");
  } catch {
    return [];
  }
}

const TONES = [
  { bg: "bg-sun-200", tile: "bg-coral-100", pattern: TILE_PATTERNS.line, emoji: "啟" },
  { bg: "bg-mint-200", tile: "bg-sky2-100", pattern: TILE_PATTERNS.knight, emoji: "進" },
  { bg: "bg-coral-200", tile: "bg-sun-100", pattern: TILE_PATTERNS.shape, emoji: "段" },
  { bg: "bg-sky2-200", tile: "bg-mint-100", pattern: TILE_PATTERNS.enclose, emoji: "賽" },
  { bg: "bg-grape-200", tile: "bg-cream-100", pattern: TILE_PATTERNS.hoshi, emoji: "高" },
];

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-sun-300 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-mint-200 right-[-6rem] top-12" />

        <div className="container-page relative py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-sun-300 px-4 py-1.5 text-sm font-bold tracking-wider text-ink shadow-pop-sm">
            <HoshiCluster className="h-3 w-3" />
            COURSES
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            依程度<br />
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-coral-300" />
              分班的課程
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            從第一顆棋子到段級檢定，每個階段都有適合的班別。第一堂課完全免費，可以先來試試看。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 font-display font-bold text-white shadow-pop-coral hover:-rotate-1 hover:bg-coral-400 active:translate-y-1"
            >
              預約免費試聽
              <Glyph name="arrow" />
            </Link>
            <Link
              href="/for-parents"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-6 py-3 font-display font-bold text-ink hover:bg-cream-100"
            >
              先看給家長的說明
            </Link>
          </div>
        </div>
      </section>

      {/* 課程列表 */}
      <section className="container-page py-8">
        {courses.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center text-ink-soft">
            還沒有設定課程，請聯絡老師。
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => {
              const tone = TONES[i % TONES.length];
              return (
                <article
                  key={c.id}
                  className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] ${tone.bg} p-6 shadow-pop transition-transform hover:-translate-y-1 ${
                    i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1"
                  }`}
                >
                  <div className="dot-grid pointer-events-none absolute inset-0 -z-0 opacity-30" />

                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className={`grid h-14 w-14 -rotate-6 place-items-center rounded-2xl ${tone.tile} shadow-pop-sm`}
                    >
                      <StoneTile pattern={tone.pattern} />
                    </span>
                    <span className="font-display text-4xl font-bold text-ink/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    {c.age_range && (
                      <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-ink">
                        {c.age_range}
                      </span>
                    )}
                    <h3 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {c.description}
                      </p>
                    )}
                  </div>

                  {/* 課程資訊 */}
                  <dl className="relative mt-5 space-y-1.5 text-sm">
                    {c.duration && (
                      <div className="flex gap-2">
                        <dt className="w-12 shrink-0 text-xs font-bold text-ink-soft">時長</dt>
                        <dd className="text-ink">{c.duration}</dd>
                      </div>
                    )}
                    {c.schedule && (
                      <div className="flex gap-2">
                        <dt className="w-12 shrink-0 text-xs font-bold text-ink-soft">時段</dt>
                        <dd className="text-ink">{c.schedule}</dd>
                      </div>
                    )}
                    {c.price && (
                      <div className="flex gap-2">
                        <dt className="w-12 shrink-0 text-xs font-bold text-ink-soft">學費</dt>
                        <dd className="text-ink">{c.price}</dd>
                      </div>
                    )}
                    {c.level && (
                      <div className="flex gap-2">
                        <dt className="w-12 shrink-0 text-xs font-bold text-ink-soft">級別</dt>
                        <dd className="text-ink">{c.level}</dd>
                      </div>
                    )}
                  </dl>

                  {/* 課程特色 */}
                  {c.features.length > 0 && (
                    <ul className="relative mt-5 space-y-1.5 border-t-2 border-white/60 pt-4 text-sm">
                      {c.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-ink">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href="/register"
                    className="relative mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream-100 group-hover:bg-ink/90"
                  >
                    我想試聽這班
                    <Glyph name="arrow" size={14} />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 一段平台補充 */}
      <section className="container-page py-12">
        <div className="rounded-[2.5rem] bg-cream-100 p-8 md:p-12">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            不知道孩子適合哪一班？
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            試聽前我們會先和家長聊聊孩子的年齡、有沒有接觸過、個性，然後安排合適的班別。第一節完全免費、不收材料費、不推銷。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 font-display font-bold text-white shadow-pop-coral hover:-rotate-1 hover:bg-coral-400 active:translate-y-1"
            >
              預約免費試聽
              <Glyph name="arrow" />
            </Link>
            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-6 py-3 font-display font-bold text-ink hover:bg-cream-200"
            >
              認識老師
            </Link>
          </div>
        </div>
      </section>

      <div className="h-32" />
    </>
  );
}
