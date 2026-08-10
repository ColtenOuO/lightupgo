import Link from "next/link";

import { Glyph, NumberStamp, StoneTile, TILE_PATTERNS, patternFor } from "@/components/public/glyph";
import { apiGet } from "@/lib/api";
import type { Card as CardData } from "@/lib/types";

export const metadata = {
  title: "給小朋友",
  description: "圍棋其實超好玩 — 黑白小子打架、蓋城堡、吃豆豆",
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

/**
 * 各區塊預設資料 — 後台 cards 沒資料時使用。
 * 後台填入後即覆蓋（依 page="for_kids", section=...）。
 */
const DEFAULT_GAMES: Partial<CardData>[] = [
  {
    title: "黑白小子打架",
    body: "把對方的小子圍住，就可以把它「吃」掉。看誰先圍到！",
    icon: "enclose",
  },
  {
    title: "蓋自己的城堡",
    body: "圍出愈大的地盤，就贏愈多分！像在地圖上畫自己的領土。",
    icon: "shape",
  },
  {
    title: "想三步棋的偵探",
    body: "猜對手下一步要去哪，再決定自己要下哪 — 變成厲害的偵探！",
    icon: "knight",
  },
  {
    title: "升級打怪",
    body: "20 級 → 1 級 → 段位！每一階都有不同的挑戰跟獎牌。",
    icon: "jump",
  },
];

const DEFAULT_REWARDS: Partial<CardData>[] = [
  { title: "每次上課有貼紙", icon: "black" },
  { title: "升級拿小獎章", icon: "hoshi" },
  { title: "贏老師可以挑戰新關卡", icon: "twin" },
  { title: "認識愛下棋的好朋友", icon: "pair" },
];

const DEFAULT_FLOW: Partial<CardData>[] = [
  {
    title: "暖身小遊戲",
    body: "今天先抓死活、找氣，30 秒題目搶答！",
  },
  {
    title: "和朋友下一盤",
    body: "找一個程度差不多的同學對局，老師在旁邊看。",
  },
  {
    title: "老師講解 + 拿貼紙",
    body: "今天進步在哪？老師會貼一張勳章貼紙在你的小手冊。",
  },
];

function pick<T>(api: T[], fallback: T[]): T[] {
  return api.length > 0 ? api : fallback;
}

export default async function ForKidsPage() {
  const [games, rewards, flow] = await Promise.all([
    safe(apiGet<CardData[]>("/api/v1/cards?page=for_kids&section=games"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=for_kids&section=rewards"), []),
    safe(apiGet<CardData[]>("/api/v1/cards?page=for_kids&section=flow"), []),
  ]);

  const gameItems = pick<Partial<CardData>>(games, DEFAULT_GAMES);
  const rewardItems = pick<Partial<CardData>>(rewards, DEFAULT_REWARDS);
  const flowItems = pick<Partial<CardData>>(flow, DEFAULT_FLOW);

  const gameTones = ["bg-coral-200", "bg-mint-200", "bg-sky2-200", "bg-grape-200"];
  const flowTones = ["bg-coral-200", "bg-mint-200", "bg-sky2-200"];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-grape-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-coral-200 right-[-6rem] top-20" />

        <div className="container-page relative py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-grape-200 px-4 py-1.5 text-sm font-bold tracking-wider text-grape-600 shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-grape-600 animate-bounce-soft" />
            FOR KIDS
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            你來了！<br />
            想不想{" "}
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-sun-300" />
              玩超好玩
            </span>{" "}
            的遊戲？
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            圍棋不是無聊的桌遊喔！它其實是…
          </p>

          {/* Hero 下方浮動小棋子 */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <span className="grid h-12 w-12 -rotate-12 place-items-center rounded-2xl bg-coral-300 shadow-pop animate-float">
              <StoneTile pattern={TILE_PATTERNS.black} />
            </span>
            <span className="grid h-12 w-12 rotate-6 place-items-center rounded-2xl bg-mint-300 shadow-pop animate-bounce-soft">
              <StoneTile pattern={TILE_PATTERNS.white} />
            </span>
            <span className="grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-sun-300 shadow-pop animate-sway">
              <StoneTile pattern={TILE_PATTERNS.pair} />
            </span>
          </div>
        </div>
      </section>

      {/* 4 個遊戲玩法卡 */}
      <section className="container-page py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {gameItems.map((g, i) => (
            <div
              key={(g.id as string) ?? g.title ?? i}
              className={`relative overflow-hidden rounded-[2rem] ${gameTones[i % gameTones.length]} p-7 shadow-pop transition-transform hover:-translate-y-1 ${
                i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1"
              }`}
            >
              <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/60 font-display text-base font-bold text-ink/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative grid h-16 w-16 -rotate-6 place-items-center rounded-2xl bg-white shadow-pop-sm">
                <StoneTile pattern={patternFor(g.icon, i)} />
              </span>
              <h3 className="relative mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
                {g.title}
              </h3>
              <p className="relative mt-2 text-ink-soft">{g.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 你可以拿到什麼 */}
      <section className="container-page py-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-sun-200 p-8 dot-grid md:p-12">
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            在立光，你會拿到
          </h2>
          <p className="mt-2 text-ink-soft">不只是棋藝，還有滿滿的小驚喜。</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rewardItems.map((r, i) => (
              <div
                key={(r.id as string) ?? r.title ?? i}
                className={`relative rounded-2xl bg-white p-5 shadow-pop-sm transition-transform hover:-translate-y-1 ${
                  i % 2 === 0 ? "rotate-[-1deg]" : "rotate-1"
                }`}
              >
                <span className="inline-grid h-12 w-12 -rotate-6 place-items-center rounded-xl bg-coral-100 shadow-pop-sm">
                  <StoneTile pattern={patternFor(r.icon, i + 4)} />
                </span>
                <p className="mt-3 font-display text-base font-bold text-ink">
                  {r.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 上課長怎樣 */}
      <section className="container-page py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
              上課是這樣的
            </h2>
            <p className="mt-2 text-ink-soft">不是坐著聽課喔，是一直在玩！</p>
          </div>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {flowItems.map((s, i) => (
            <li
              key={(s.id as string) ?? s.title ?? i}
              className={`relative rounded-[1.75rem] ${flowTones[i % flowTones.length]} p-6 shadow-pop transition-transform hover:-translate-y-1`}
            >
              <NumberStamp n={i + 1} className="absolute -top-4 left-5" />
              <h3 className="mt-6 font-display text-xl font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="container-page py-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-coral-300 via-sun-200 to-grape-200 p-8 text-center shadow-pop-lg md:p-14">
          <span className="absolute left-8 top-8 inline-block h-10 w-10 rotate-12 rounded-2xl bg-white/80 shadow-pop-sm animate-bounce-soft" />
          <span className="absolute right-12 top-10 inline-block h-7 w-7 -rotate-6 rounded-full bg-white/80 shadow-pop-sm animate-float" />
          <span className="absolute bottom-10 right-8 grid h-12 w-12 rotate-6 place-items-center rounded-2xl bg-white/80 shadow-pop-sm">
            <StoneTile pattern={TILE_PATTERNS.hoshi} />
          </span>

          <h2 className="font-display text-3xl font-bold text-ink md:text-5xl">
            想試一節嗎？
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-soft">
            找爸爸媽媽幫你按這顆按鈕，老師會帶你玩第一節課。
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-display text-lg font-bold text-cream-100 shadow-pop hover:-rotate-1 active:translate-y-1"
          >
            我要報名免費試聽
            <Glyph name="arrow" />
          </Link>
        </div>
      </section>

      <div className="h-32" />
    </>
  );
}
