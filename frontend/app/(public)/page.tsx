import Link from "next/link";

import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import type {
  Card as CardData,
  Course,
  SiteSettings,
} from "@/lib/types";

async function getCards(section?: string): Promise<CardData[]> {
  try {
    const qs = section ? `?page=home&section=${section}` : "?page=home";
    return await apiGet<CardData[]>(`/api/v1/cards${qs}`);
  } catch {
    return [];
  }
}

async function getCourses(): Promise<Course[]> {
  try {
    return await apiGet<Course[]>("/api/v1/courses");
  } catch {
    return [];
  }
}

async function getSettings(): Promise<SiteSettings | null> {
  try {
    return await apiGet<SiteSettings>("/api/v1/settings", { revalidate: 300 });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [hero, stats, whyUs, ctaBottom, courses, settings] = await Promise.all([
    getCards("hero"),
    getCards("stats"),
    getCards("why_us"),
    getCards("cta"),
    getCourses(),
    getSettings(),
  ]);

  const heroCard = hero[0];
  const ctaCard = ctaBottom[0];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-sun-300 left-[-4rem] top-[-4rem]" />
        <div className="blob h-72 w-72 bg-mint-200 right-[-4rem] top-32" />

        <div className="container-page relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-mint-100 px-4 py-1.5 text-sm font-bold text-mint-700">
              ● ○ {settings?.tagline ?? "圍棋教室"}
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
              {heroCard?.title ?? "讓每一步都更有想法"}
            </h1>
            {(heroCard?.body || settings?.hero_subtitle) && (
              <p className="mt-4 text-lg text-ink-soft md:text-xl">
                {heroCard?.body ?? settings?.hero_subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={heroCard?.cta_url ?? "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral-500 px-8 py-4 font-display text-lg font-bold text-white shadow-pop-coral hover:bg-coral-400 active:translate-y-1"
              >
                {heroCard?.cta_text ?? "免費試聽"} →
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink/20 bg-white px-8 py-4 font-display text-lg font-bold text-ink hover:bg-cream-200"
              >
                看看課程
              </Link>
            </div>
          </div>

          <div className="relative grid place-items-center">
            <div className="aspect-square w-full max-w-md rounded-[2.5rem] bg-gradient-to-br from-sun-300 via-coral-300 to-mint-300 p-2 shadow-pop">
              <div className="grid h-full w-full place-items-center rounded-[2.25rem] bg-cream-100">
                <div className="grid grid-cols-3 gap-3">
                  <span className="h-8 w-8 rounded-full bg-ink" />
                  <span className="h-8 w-8 rounded-full border-2 border-ink/20 bg-white" />
                  <span className="h-8 w-8 rounded-full bg-ink" />
                  <span className="h-8 w-8 rounded-full border-2 border-ink/20 bg-white" />
                  <span className="h-8 w-8 rounded-full bg-ink animate-bounce-soft" />
                  <span className="h-8 w-8 rounded-full border-2 border-ink/20 bg-white" />
                  <span className="h-8 w-8 rounded-full border-2 border-ink/20 bg-white" />
                  <span className="h-8 w-8 rounded-full bg-ink" />
                  <span className="h-8 w-8 rounded-full border-2 border-ink/20 bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      {stats.length > 0 && (
        <section className="container-page py-12">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {stats.map((s, idx) => (
              <Card
                key={s.id}
                className={
                  idx % 4 === 0
                    ? "bg-sun-100"
                    : idx % 4 === 1
                      ? "bg-coral-100"
                      : idx % 4 === 2
                        ? "bg-mint-100"
                        : "bg-sky2-100"
                }
              >
                <div className="font-display text-4xl font-bold text-ink md:text-5xl">
                  {s.title}
                </div>
                {s.subtitle && (
                  <div className="mt-2 text-base text-ink-soft">
                    {s.subtitle}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Why us ─────────────────────────────────────── */}
      {whyUs.length > 0 && (
        <section className="container-page py-16">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
              為什麼選立光？
            </h2>
            <p className="mt-2 text-ink-soft">小朋友開心、家長安心</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((c) => (
              <Card key={c.id}>
                <CardTitle className="text-coral-600">{c.title}</CardTitle>
                {c.body && <CardBody>{c.body}</CardBody>}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Courses preview ────────────────────────────── */}
      {courses.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
                依程度分班的課程
              </h2>
              <p className="mt-2 text-ink-soft">從零開始到段級檢定都有班</p>
            </div>
            <Link
              href="/courses"
              className="hidden text-sm font-bold text-mint-700 hover:text-mint-600 md:inline"
            >
              全部課程 →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {courses.slice(0, 3).map((c) => (
              <Card key={c.id} className="flex flex-col bg-white">
                <span className="inline-flex w-fit rounded-full bg-sun-200 px-3 py-1 text-xs font-bold text-ink">
                  {c.age_range ?? c.level}
                </span>
                <CardTitle className="mt-3">{c.name}</CardTitle>
                {c.description && <CardBody>{c.description}</CardBody>}
                <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                  {c.features.map((f) => (
                    <li key={f}>● {f}</li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-mint-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-mint-400"
                >
                  我想試聽這班
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA bottom ─────────────────────────────────── */}
      <section className="container-page py-16">
        <div className="rounded-[2.5rem] bg-ink p-8 text-center md:p-14">
          <h2 className="font-display text-3xl font-bold text-cream-200 md:text-4xl">
            {ctaCard?.title ?? "幫孩子開啟下棋的第一步"}
          </h2>
          {ctaCard?.subtitle && (
            <p className="mt-3 text-cream-200/80">{ctaCard.subtitle}</p>
          )}
          <Link
            href={ctaCard?.cta_url ?? "/register"}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-sun-500 px-8 py-4 font-display text-lg font-bold text-ink shadow-pop-sun hover:bg-sun-400 active:translate-y-1"
          >
            {ctaCard?.cta_text ?? "立即報名"} →
          </Link>
        </div>
      </section>
    </>
  );
}
