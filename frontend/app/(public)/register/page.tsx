import Link from "next/link";

import { Glyph, NumberStamp, StoneTile, patternFor } from "@/components/public/glyph";
import { apiGet } from "@/lib/api";
import type { Card as CardData, SiteSettings } from "@/lib/types";

export const metadata = {
  title: "最新課程報名",
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

const DEFAULT_STEPS: Partial<CardData>[] = [
  { title: "選課程", body: "看下方兩份招生中的課程，挑一份送出。" },
  { title: "我們聯絡你", body: "1–2 個工作天內回覆，確認上課時段。" },
  { title: "來上第一堂", body: "60 分鐘，孩子會玩到三個小遊戲。" },
  { title: "決定要不要繼續", body: "我們不推銷，回家想好再回覆。" },
];

const DEFAULT_TRUST: Partial<CardData>[] = [
  { title: "招生中", icon: "black" },
  { title: "不推銷", icon: "white" },
  { title: "資料保密", icon: "enclose" },
  { title: "5 歲起可參加", icon: "pair" },
];

const DEFAULT_QUICK_FAQ: Partial<CardData>[] = [
  { title: "需要自己帶棋具嗎？", body: "完全不用，現場全部準備好。" },
  {
    title: "可以家長陪同嗎？",
    body: "歡迎，會安排家長休息區，看得到孩子但不會打擾上課。",
  },
  {
    title: "送出表單後多久回覆？",
    body: "通常 1–2 個工作天內，老師會打電話或加 LINE 跟你聯絡。",
  },
];

function pick<T>(api: T[], fallback: T[]): T[] {
  return api.length > 0 ? api : fallback;
}

type Props = {
  searchParams?: { form?: string };
};

export default async function RegisterPage({ searchParams }: Props) {
  const [settings, steps, trust, quickFaq, forms] = await Promise.all([
    safe(apiGet<SiteSettings>("/api/v1/settings", { revalidate: 60 }), null as SiteSettings | null),
    safe(apiGet<CardData[]>("/api/v1/cards?page=register&section=steps"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=register&section=trust"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=register&section=quick_faq"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=register&section=forms"), []),
  ]);

  const stepItems = pick<Partial<CardData>>(steps, DEFAULT_STEPS);
  const trustItems = pick<Partial<CardData>>(trust, DEFAULT_TRUST);
  const quickFaqItems = pick<Partial<CardData>>(quickFaq, DEFAULT_QUICK_FAQ);

  // 多份表單模式
  const hasMultiForms = forms.length > 0;
  // 選中哪份表單；預設第一份
  const selectedIdx = (() => {
    const n = Number(searchParams?.form ?? "1");
    if (!Number.isFinite(n) || n < 1) return 0;
    return Math.min(n - 1, Math.max(0, forms.length - 1));
  })();
  const selectedForm = hasMultiForms ? forms[selectedIdx] : null;

  // fallback：舊的單一 settings.register_form_url
  const fallbackFormUrl = settings?.register_form_url?.trim();
  const note =
    settings?.register_form_note ??
    "報名連結整理中，敬請期待，或來電預約：" + (settings?.phone ?? "");

  const stepTones = ["bg-sun-200", "bg-coral-200", "bg-mint-200", "bg-sky2-200"];
  const formTones = ["bg-coral-200", "bg-mint-200", "bg-sky2-200", "bg-grape-200"];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-coral-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-sun-200 right-[-6rem] top-12" />

        <div className="container-page relative py-12 text-center md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-coral-200 px-4 py-1.5 text-sm font-bold tracking-wider text-coral-700 shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-coral-700 animate-bounce-soft" />
            招生中 · 2 個班別
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            最新課程<br className="md:hidden" />
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-sun-300" />
              開放報名
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            兩份招生中的課程表單，選一份填寫，老師會在 1–2 個工作天內聯絡你。
          </p>

          {/* 信任徽章 */}
          <ul className="mt-7 inline-flex flex-wrap items-center justify-center gap-2">
            {trustItems.map((t, i) => (
              <li
                key={(t.id as string) ?? t.title ?? i}
                className={`flex items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-4 text-sm font-bold text-ink shadow-pop-sm ${
                  i % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]"
                }`}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-cream-100">
                  <StoneTile pattern={patternFor(t.icon, i)} />
                </span>
                {t.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 步驟流程 */}
      <section className="container-page py-4">
        <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
          流程很簡單，{stepItems.length} 步驟
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-4">
          {stepItems.map((s, i) => (
            <li
              key={(s.id as string) ?? s.title ?? i}
              className={`relative rounded-[1.75rem] ${stepTones[i % stepTones.length]} p-6 shadow-pop transition-transform hover:-translate-y-1 ${
                i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1"
              }`}
            >
              <NumberStamp n={i + 1} className="absolute -top-4 left-5" />
              <h3 className="mt-6 font-display text-lg font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 多表單模式 ── 選擇課程 */}
      {hasMultiForms && (
        <section className="container-page py-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-grid h-9 w-9 -rotate-6 place-items-center rounded-xl bg-ink text-cream-100">
              <StoneTile pattern="b.w.b.w.b" />
            </span>
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
              請選擇課程
            </h2>
            <span className="rounded-full bg-coral-100 px-3 py-1 text-xs font-bold tracking-wider text-coral-700">
              CHOOSE A FORM
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {forms.map((f, i) => {
              const active = i === selectedIdx;
              return (
                <Link
                  key={f.id}
                  href={`/register?form=${i + 1}#form`}
                  scroll
                  className={`group relative overflow-hidden rounded-[1.75rem] ${formTones[i % formTones.length]} p-6 shadow-pop transition-transform hover:-translate-y-1 ${
                    active ? "ring-4 ring-ink/30" : ""
                  } ${i % 2 === 0 ? "hover:-rotate-[0.5deg]" : "hover:rotate-[0.5deg]"}`}
                >
                  {active && (
                    <span className="absolute right-4 top-4 inline-grid h-8 w-12 -rotate-6 place-items-center rounded-md bg-ink text-[10px] font-bold tracking-wider text-cream-100 shadow-pop-sm">
                      已選擇
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="grid h-14 w-14 -rotate-6 place-items-center rounded-2xl bg-white shadow-pop-sm">
                      <StoneTile pattern={patternFor(f.icon, i)} />
                    </span>
                    <span className="font-display text-4xl font-bold text-ink/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink md:text-2xl">
                    {f.title}
                  </h3>
                  {f.subtitle && (
                    <p className="mt-1 text-xs font-bold text-coral-700">
                      {f.subtitle}
                    </p>
                  )}
                  {f.body && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {f.body}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream-100 group-hover:bg-ink/90">
                    {active ? "看下方表單" : f.cta_text ?? "切換到這份"}
                    <Glyph name="arrow" size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 表單嵌入 + 側欄 */}
      <section id="form" className="container-page py-8 scroll-mt-24">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {hasMultiForms && selectedForm ? (
              <FormFrame
                title={selectedForm.title ?? `課程報名 ${selectedIdx + 1}`}
                url={selectedForm.cta_url ?? ""}
              />
            ) : fallbackFormUrl ? (
              <FormFrame title="課程報名" url={fallbackFormUrl} />
            ) : (
              <NoFormFallback
                note={note}
                phone={settings?.phone ?? null}
              />
            )}
          </div>

          {/* 右側：FAQ + 聯絡 */}
          <aside className="space-y-5">
            <div className="rounded-[1.75rem] bg-mint-200 p-6 shadow-pop">
              <h3 className="font-display text-lg font-bold text-ink">
                報名前常見問題
              </h3>
              <div className="mt-4 space-y-2.5">
                {quickFaqItems.map((f, i) => (
                  <details
                    key={(f.id as string) ?? f.title ?? i}
                    className="group rounded-xl bg-white/80 p-3 transition-all open:bg-white"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-bold text-ink">
                      <span className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold text-mint-700">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {f.title}
                      </span>
                      <span className="text-coral-600 group-open:rotate-45 transition-transform">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-ink-soft">{f.body}</p>
                  </details>
                ))}
              </div>
            </div>

            {(settings?.phone || settings?.business_hours) && (
              <div className="rounded-[1.75rem] bg-ink p-6 text-cream-100 shadow-pop">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-sun-300">
                  <Glyph name="phone" size={20} />
                  也可以直接打電話
                </h3>
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="mt-3 block font-display text-3xl font-bold text-cream-100 hover:text-sun-200"
                  >
                    {settings.phone}
                  </a>
                )}
                {settings?.business_hours && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-cream-100/70">
                    <Glyph name="clock" size={14} />
                    {settings.business_hours}
                  </p>
                )}
              </div>
            )}

            <Link
              href="/for-parents"
              className="block rounded-[1.75rem] bg-sun-200 p-6 shadow-pop transition-transform hover:-translate-y-1 hover:rotate-1"
            >
              <p className="text-xs font-bold tracking-wider text-coral-700">
                想多了解一點？
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-display text-lg font-bold text-ink">
                看給家長的完整說明 <Glyph name="arrow" size={16} />
              </p>
            </Link>
          </aside>
        </div>
      </section>

      <div className="h-32" />
    </>
  );
}

function FormFrame({ title, url }: { title: string; url: string }) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-pop">
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-cream-200 bg-cream-100 px-5 py-3">
        <span className="h-3 w-3 rounded-full bg-coral-400" />
        <span className="h-3 w-3 rounded-full bg-sun-400" />
        <span className="h-3 w-3 rounded-full bg-mint-400" />
        <span className="ml-3 min-w-0 flex-1 truncate text-sm font-bold tracking-wider text-ink-soft">
          {title.toUpperCase()}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink hover:bg-cream-200"
        >
          在新分頁開啟 ↗
        </a>
      </div>
      <iframe
        title={title}
        src={url}
        className="h-[1100px] w-full"
        loading="lazy"
      />
    </div>
  );
}

function NoFormFallback({
  note,
  phone,
}: {
  note: string;
  phone: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream-100 to-sun-100 p-8 shadow-pop md:p-10">
      <span className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sun-300/40 blur-3xl" />
      <span className="relative grid h-16 w-16 -rotate-6 place-items-center rounded-2xl bg-white shadow-pop-sm">
        <StoneTile pattern="b.w.b.w.b" />
      </span>
      <h2 className="relative mt-4 font-display text-2xl font-bold text-ink">
        表單整理中
      </h2>
      <p className="relative mt-2 text-ink-soft">{note}</p>
      <div className="relative mt-6 flex flex-wrap gap-3">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 font-display font-bold text-white shadow-pop-coral hover:-rotate-1 hover:bg-coral-400 active:translate-y-1"
          >
            <Glyph name="phone" />
            撥打 {phone}
          </a>
        )}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-6 py-3 font-display font-bold text-ink hover:bg-cream-200"
        >
          先看課程介紹
        </Link>
      </div>
    </div>
  );
}
