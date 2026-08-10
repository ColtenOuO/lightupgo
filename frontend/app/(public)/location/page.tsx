import Link from "next/link";

import { Glyph, HoshiCluster } from "@/components/public/glyph";
import { apiGet } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export const metadata = {
  title: "教室位置",
};

async function getSettings(): Promise<SiteSettings | null> {
  try {
    return await apiGet<SiteSettings>("/api/v1/settings", { revalidate: 300 });
  } catch {
    return null;
  }
}

export default async function LocationPage() {
  const s = await getSettings();
  const siteName = s?.site_name ?? "立光圍棋教室";
  const placeQuery = s?.address?.trim() || siteName;
  // 用 Google Maps 搜尋嵌入（不需 API key）— 把店名 / 地址當 query。
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(placeQuery)}&output=embed`;
  const externalMapUrl =
    s?.map_url?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery)}`;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-sun-300 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-mint-200 right-[-6rem] top-12" />

        <div className="container-page relative py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-sun-300 px-4 py-1.5 text-sm font-bold tracking-wider text-ink shadow-pop-sm">
            <HoshiCluster className="h-3 w-3" />
            LOCATION
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            來教室<br />
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-coral-300" />
              找我們下棋
            </span>
          </h1>
        </div>
      </section>

      {/* 地圖 + 資訊 */}
      <section className="container-page py-4">
        <div className="grid gap-6 md:grid-cols-5">
          {/* 地圖 */}
          <div className="md:col-span-3">
            <div className="overflow-hidden rounded-[2rem] border-4 border-ink/10 bg-white shadow-pop-lg">
              <iframe
                title="教室位置"
                src={embedSrc}
                className="h-[420px] w-full md:h-[520px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-display text-sm font-bold text-cream-100 hover:-rotate-1 hover:bg-ink/90"
            >
              在 Google Maps 開啟
              <Glyph name="arrow" size={14} />
            </a>
          </div>

          {/* 右側：資訊卡 */}
          <aside className="space-y-4 md:col-span-2">
            <div className="rounded-[1.75rem] bg-mint-200 p-6 shadow-pop">
              <p className="text-xs font-bold tracking-wider text-mint-800">教室名稱</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {siteName}
              </p>
              {s?.address && (
                <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-ink">
                  <Glyph name="pin" className="mt-0.5 shrink-0 text-mint-800" size={16} />
                  <span>{s.address}</span>
                </p>
              )}
            </div>

            {s?.phone && (
              <a
                href={`tel:${s.phone}`}
                className="block rounded-[1.75rem] bg-coral-200 p-6 shadow-pop transition-transform hover:-translate-y-1 hover:-rotate-1"
              >
                <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-coral-800">
                  <Glyph name="phone" size={14} />
                  電話
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
                  {s.phone}
                </p>
                <p className="mt-1 text-xs text-coral-700">點擊撥打</p>
              </a>
            )}

            {s?.business_hours && (
              <div className="rounded-[1.75rem] bg-sun-200 p-6 shadow-pop">
                <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink">
                  <Glyph name="clock" size={14} />
                  營業時間
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {s.business_hours}
                </p>
              </div>
            )}

            {s?.line_id && (
              <div className="rounded-[1.75rem] bg-cream-100 p-6 shadow-pop">
                <p className="text-xs font-bold tracking-wider text-mint-700">LINE</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">
                  {s.line_id}
                </p>
                <p className="mt-1 text-xs text-ink-soft">加 LINE 詢問課程細節</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* 來教室路線提示 */}
      <section className="container-page py-12">
        <div className="rounded-[2rem] bg-cream-100 p-8 md:p-10">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            第一次來嗎？
          </h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            <li className="rounded-2xl bg-white p-5 shadow-pop-sm">
              <p className="font-display text-base font-bold text-coral-700">先預約</p>
              <p className="mt-1 text-sm text-ink-soft">
                先撥電話或填試聽表，老師會回電安排時段。
              </p>
            </li>
            <li className="rounded-2xl bg-white p-5 shadow-pop-sm">
              <p className="font-display text-base font-bold text-mint-700">早 10 分鐘到</p>
              <p className="mt-1 text-sm text-ink-soft">
                第一次來，建議早一點到先熟悉環境。
              </p>
            </li>
            <li className="rounded-2xl bg-white p-5 shadow-pop-sm">
              <p className="font-display text-base font-bold text-sky2-700">空手來就好</p>
              <p className="mt-1 text-sm text-ink-soft">
                棋具老師都準備好，孩子帶著好奇心來就行。
              </p>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 font-display font-bold text-white shadow-pop-coral hover:-rotate-1 hover:bg-coral-400 active:translate-y-1"
            >
              預約免費試聽
              <Glyph name="arrow" />
            </Link>
            {s?.phone && (
              <a
                href={`tel:${s.phone}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-6 py-3 font-display font-bold text-ink hover:bg-cream-200"
              >
                <Glyph name="phone" size={16} />
                直接打電話
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="h-32" />
    </>
  );
}
