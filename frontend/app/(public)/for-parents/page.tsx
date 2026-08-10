import Image from "next/image";
import Link from "next/link";

import { Glyph, StoneTile, patternFor } from "@/components/public/glyph";
import { apiGet, resolveImageUrl } from "@/lib/api";
import type { Card as CardData, GalleryItem, SiteSettings } from "@/lib/types";

export const metadata = {
  title: "給家長",
  description: "圍棋如何幫助孩子培養專注、邏輯與抗壓 — 一份給家長的完整說明。",
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

// ── 預設 fallback ─────────────────────────────────────
const DEFAULT_PARENT_STATS: Partial<CardData>[] = [
  { title: "10+", subtitle: "年教學經驗" },
  { title: "100+", subtitle: "位累積學員" },
  { title: "4–6", subtitle: "人小班制" },
  { title: "1:1", subtitle: "個別復盤" },
];

const DEFAULT_BENEFITS: Partial<CardData>[] = [
  {
    title: "專注力",
    body: "一盤棋平均 30–60 分鐘，孩子要持續觀察、計算，是少數能讓他們「自願坐住」的活動。",
    icon: "hoshi",
  },
  {
    title: "邏輯思考",
    body: "每一手都需要預想三步以上：對方會怎麼回？我又該怎麼接？大腦在不知不覺中變強壯。",
    icon: "knight",
  },
  {
    title: "抗壓 / 情緒",
    body: "圍棋一定會輸，輸完還要復盤。孩子練習面對挫折、找原因、再來一次 — 不是哭就好。",
    icon: "enclose",
  },
  {
    title: "社交禮儀",
    body: "「請多指教」「謝謝指教」每一局都會說。和不同年齡的對手互動，自然長出社交感。",
    icon: "pair",
  },
  {
    title: "空間感 / 數學",
    body: "棋盤就是一個 19×19 的數學世界，孩子在算地的過程中，培養加減乘除的直覺。",
    icon: "shape",
  },
  {
    title: "中文 / 文化",
    body: "對局用語、棋譜閱讀，自然延伸到中文閱讀理解，也接上 4000 年的東方文化脈絡。",
    icon: "sansan",
  },
];

const DEFAULT_WORRIES: Partial<CardData>[] = [
  {
    title: "孩子坐不住，會不會學沒幾節就放棄？",
    body: "前三堂我們刻意把節奏切碎：暖身小遊戲 → 短局 → 老師講解，每段不超過 15 分鐘。",
  },
  {
    title: "我自己不會下棋，沒辦法教他。",
    body: "完全沒問題！我們會每月給家長一份「進度小報」，告訴你孩子在學什麼、可以問他哪些問題。",
  },
  {
    title: "輸了會不會大哭、玻璃心？",
    body: "前期老師會主動配對程度相近的同學，並引導「復盤」的習慣：找一個今天做得好的地方、一個下次可改的地方。",
  },
  {
    title: "會不會跟學校功課衝突？",
    body: "我們不要求在家練習。一週 90 分鐘的課程，就足夠維持進步；段位班的孩子才會建議多花時間。",
  },
];

const DEFAULT_FAQ: Partial<CardData>[] = [
  {
    title: "我的孩子完全不會下棋，可以嗎？",
    body: "可以！我們有「啟蒙班」就是給完全沒接觸過的孩子，從拿棋子、認識黑白開始，前三節都是玩遊戲，不會壓力很大。",
  },
  {
    title: "幾歲開始學最適合？",
    body: "5 歲（大班）以上都可以。最早的學員 4 歲半開始；如果孩子可以坐住 20 分鐘、會數 1–20，就可以來試聽看看。",
  },
  {
    title: "一週要上幾次？要練多久？",
    body: "一般建議每週 1 次（90 分鐘），平日 / 假日都有班。在家不一定要練，但如果孩子有興趣，我們會推薦免費的對局 App。",
  },
  {
    title: "學費怎麼算？有沒有試聽費？",
    body: "第一節「免費試聽」完全不收費，也不會推銷。試聽後如果決定加入，我們會依照孩子的程度安排合適的班別，學費以期報名。",
  },
  {
    title: "孩子個性比較內向，會不會被欺負？",
    body: "圍棋班通常都是 4–8 人小班，老師會配對程度相近的同學對局。內向的孩子在棋盤上反而很有優勢 — 安靜、會觀察。",
  },
  {
    title: "和心算 / 程式 / 數學課比，差別是？",
    body: "圍棋同時練「右腦的圖像感」與「左腦的計算」，更接近真實生活的決策練習：資訊不完整、有對手、要承擔結果。",
  },
];

function pick<T>(api: T[], fallback: T[]): T[] {
  return api.length > 0 ? api : fallback;
}

export default async function ForParentsPage() {
  const [settings, parentStats, benefits, worries, faq, gallery] = await Promise.all([
    safe(apiGet<SiteSettings>("/api/v1/settings", { revalidate: 300 }), null as SiteSettings | null),
    safe(apiGet<CardData[]>("/api/v1/cards?page=for_parents&section=stats"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=for_parents&section=benefits"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=for_parents&section=worries"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=for_parents&section=faq"), []),
    safe(apiGet<GalleryItem[]>("/api/v1/gallery?category=competition"), [] as GalleryItem[]),
  ]);

  const statItems = pick<Partial<CardData>>(parentStats, DEFAULT_PARENT_STATS);
  const benefitItems = pick<Partial<CardData>>(benefits, DEFAULT_BENEFITS);
  const worryItems = pick<Partial<CardData>>(worries, DEFAULT_WORRIES);
  const faqItems = pick<Partial<CardData>>(faq, DEFAULT_FAQ);

  const benefitTones = [
    "bg-sun-200",
    "bg-mint-200",
    "bg-coral-200",
    "bg-sky2-200",
    "bg-grape-200",
    "bg-cream-100",
  ];
  const statTones = ["bg-sun-200", "bg-coral-200", "bg-mint-200", "bg-sky2-200"];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-mint-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-sky2-200 right-[-6rem] top-20" />

        <div className="container-page relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-200 px-4 py-1.5 text-sm font-bold tracking-wider text-mint-700 shadow-pop-sm">
              <span className="h-2 w-2 rounded-full bg-mint-700" />
              FOR PARENTS
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
              為什麼<br />
              <span className="relative inline-block">
                <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-mint-300" />
                選擇圍棋？
              </span>
            </h1>
            <p className="mt-5 text-lg text-ink-soft">
              我們花了 10 年陪不同個性的孩子下棋。下面整理 6 個你會在意的面向，以及家長最常問的 6 個問題。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 font-display font-bold text-white shadow-pop-coral hover:-rotate-1 hover:bg-coral-400 active:translate-y-1"
              >
                預約免費試聽
                <Glyph name="arrow" />
              </Link>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-6 py-3 font-display font-bold text-ink hover:bg-cream-200"
              >
                直接看 FAQ
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-3 sm:grid-cols-2">
              {statItems.map((s, i) => (
                <div
                  key={(s.id as string) ?? s.title ?? i}
                  className={`rounded-3xl ${statTones[i % statTones.length]} p-6 shadow-pop ${
                    i % 2 === 0 ? "rotate-[-1deg]" : "rotate-1"
                  }`}
                >
                  <div className="font-display text-4xl font-bold text-ink md:text-5xl">
                    {s.title}
                  </div>
                  <div className="mt-2 text-sm font-bold text-ink-soft">
                    {s.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 六大效益 */}
      <section className="container-page py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
              圍棋會幫孩子長出什麼？
            </h2>
            <p className="mt-2 text-ink-soft">
              不是「贏的能力」— 是「能持續面對挑戰」的能力。
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefitItems.map((b, i) => (
            <div
              key={(b.id as string) ?? b.title ?? i}
              className={`group relative overflow-hidden rounded-[1.75rem] ${benefitTones[i % benefitTones.length]} p-6 shadow-pop transition-transform hover:-translate-y-1 ${
                i % 3 === 0 ? "hover:-rotate-1" : i % 3 === 1 ? "hover:rotate-1" : "hover:-rotate-[0.5deg]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 -rotate-6 place-items-center rounded-2xl bg-white shadow-pop-sm">
                  <StoneTile pattern={patternFor(b.icon, i)} />
                </span>
                <span className="font-display text-3xl font-bold text-ink/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 比賽榮譽：用真實比賽照當社會證明 */}
      {gallery.length > 0 && (
        <section className="container-page py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ink p-8 text-cream-100 md:p-12">
            <span className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sun-400/20 blur-3xl" />
            <span className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-coral-400/20 blur-3xl" />

            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-sun-300">
                  COMPETITIONS · 2025–2026
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold text-cream-100 md:text-4xl">
                  孩子們在賽場上的表現
                </h2>
                <p className="mt-2 text-cream-100/70">
                  我們鼓勵每位學員嘗試比賽 — 結果不是重點，過程裡每一次「下完一盤」就是長大一點。
                </p>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-5 py-2.5 font-display text-sm font-bold text-ink hover:bg-sun-200"
              >
                看全部活動 <Glyph name="arrow" size={14} />
              </Link>
            </div>

            <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.slice(0, 4).map((g, i) => {
                const url = resolveImageUrl(g.image_url);
                return (
                  <div
                    key={g.id}
                    className={`group relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 shadow-pop transition-transform hover:-translate-y-1 ${
                      i % 2 === 0 ? "rotate-[-1deg] hover:rotate-1" : "rotate-1 hover:-rotate-1"
                    }`}
                  >
                    {url && (
                      <Image
                        src={url}
                        alt={g.title ?? "比賽照"}
                        fill
                        sizes="(max-width: 768px) 45vw, 22vw"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 pt-10">
                      <p className="font-display text-sm font-bold text-cream-100">
                        {g.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-8 grid grid-cols-3 gap-4 text-center md:grid-cols-3">
              <div>
                <p className="font-display text-3xl font-bold text-sun-300 md:text-4xl">
                  {gallery.length}+
                </p>
                <p className="mt-1 text-xs text-cream-100/70">張比賽紀錄</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-coral-300 md:text-4xl">
                  5+
                </p>
                <p className="mt-1 text-xs text-cream-100/70">參與盃賽</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-mint-300 md:text-4xl">
                  {Math.max(1, Math.floor(gallery.length / 2))}+
                </p>
                <p className="mt-1 text-xs text-cream-100/70">獲獎人次</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 家長的擔心 → 我們怎麼處理 */}
      <section className="container-page py-12">
        <div className="rounded-[2.5rem] bg-cream-100 p-8 md:p-12">
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            「我有點擔心…」
          </h2>
          <p className="mt-2 text-ink-soft">這些是其他家長最常跟我們聊過的事。</p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {worryItems.map((c, i) => (
              <div
                key={(c.id as string) ?? c.title ?? i}
                className="rounded-2xl border-2 border-ink/10 bg-white p-5 shadow-pop-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 -rotate-6 place-items-center rounded-lg bg-coral-200 font-display text-sm font-bold text-coral-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-base font-bold text-coral-700">
                    {c.title}
                  </p>
                </div>
                <p className="mt-3 pl-11 text-sm leading-relaxed text-ink-soft">
                  → {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-page py-12 scroll-mt-24">
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
          家長最常問
        </h2>
        <p className="mt-2 text-ink-soft">點開看完整回答。</p>

        <div className="mt-8 space-y-3">
          {faqItems.map((item, i) => (
            <details
              key={(item.id as string) ?? item.title ?? i}
              className="group rounded-3xl border-2 border-ink/10 bg-white p-5 shadow-pop-sm transition-all open:bg-sun-50 open:shadow-pop"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display font-bold text-ink">
                <span className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-coral-200 text-sm font-bold text-coral-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base md:text-lg">{item.title}</span>
                </span>
                <span className="text-2xl text-coral-600 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 pl-10 text-sm leading-relaxed text-ink-soft md:text-base">
                {item.body}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 聯絡 / 地點 */}
      {(settings?.phone || settings?.address) && (
        <section className="container-page py-12">
          <div className="grid gap-5 md:grid-cols-2">
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="group flex items-center gap-5 rounded-[2rem] bg-coral-200 p-7 shadow-pop transition-transform hover:-translate-y-1 hover:-rotate-1"
              >
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-coral-600 shadow-pop-sm">
                  <Glyph name="phone" size={28} />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-wider text-coral-700">
                    CALL US
                  </p>
                  <p className="font-display text-2xl font-bold text-ink md:text-3xl">
                    {settings.phone}
                  </p>
                </div>
              </a>
            )}
            {settings?.address && (
              <Link
                href="/location"
                className="group flex items-center gap-5 rounded-[2rem] bg-mint-200 p-7 shadow-pop transition-transform hover:-translate-y-1 hover:rotate-1"
              >
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-mint-700 shadow-pop-sm">
                  <Glyph name="pin" size={28} />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-wider text-mint-700">
                    LOCATION
                  </p>
                  <p className="font-display text-base font-bold text-ink md:text-lg">
                    {settings.address}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      <div className="h-32" />
    </>
  );
}
