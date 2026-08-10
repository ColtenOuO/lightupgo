import Link from "next/link";

import type { SiteSettings } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "首頁" },
  { href: "/for-kids", label: "給小朋友" },
  { href: "/for-parents", label: "給家長" },
  { href: "/courses", label: "課程" },
  { href: "/teachers", label: "師資" },
  { href: "/gallery", label: "相簿" },
  { href: "/announcements", label: "公告" },
  { href: "/blog", label: "部落格" },
];

export function Nav({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-30 border-b-4 border-sun-300/50 bg-cream-200/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={settings.site_name}
        >
          <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-ink shadow-pop-sm transition-transform group-hover:-rotate-6">
            {/* 黑底上一顆白子 + 角落小黃點，當品牌符號 */}
            <span className="h-5 w-5 rounded-full border-2 border-cream-100 bg-cream-100" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-ink bg-sun-400" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-ink md:text-xl">
              {settings.site_name}
            </span>
            <span className="mt-0.5 hidden text-[11px] font-bold text-mint-700 md:inline">
              {settings.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-xl px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-sun-200/70"
            >
              {item.label}
              {/* 第一個與最後一個項目下方一顆小棋子當點綴 */}
              {(i === 0 || i === NAV_ITEMS.length - 1) && (
                <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-coral-400" />
              )}
            </Link>
          ))}
        </nav>

        <Link
          href="/register"
          className="relative inline-flex items-center gap-2 rounded-full bg-coral-500 px-5 py-2.5 font-display text-sm font-bold text-white shadow-pop-coral transition-transform hover:-rotate-2 hover:bg-coral-400 active:translate-y-1 md:text-base"
        >
          <span className="absolute -right-2 -top-2 grid h-7 w-10 -rotate-12 place-items-center rounded-full bg-sun-400 text-[10px] font-bold text-ink shadow-pop-sm">
            招生中
          </span>
          最新課程報名
        </Link>
      </div>

      {/* 手機版：橫向滾動 chip 選單 */}
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-bold text-ink shadow-pop-sm hover:bg-sun-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
