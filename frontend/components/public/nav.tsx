import Link from "next/link";

import type { SiteSettings } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "首頁" },
  { href: "/teachers", label: "師資" },
  { href: "/courses", label: "課程" },
  { href: "/gallery", label: "活動相簿" },
  { href: "/blog", label: "部落格" },
  { href: "/location", label: "地點" },
];

export function Nav({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-30 border-b-4 border-cream-200 bg-cream-200/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-cream-200 font-display text-xl">
            ●
          </span>
          <span className="font-display text-xl font-bold text-ink">
            {settings.site_name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-bold text-ink hover:bg-sun-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="ml-2 rounded-full bg-coral-500 px-5 py-2 font-display font-bold text-white shadow-pop-coral hover:bg-coral-400 active:translate-y-1"
          >
            免費試聽
          </Link>
        </nav>
      </div>
    </header>
  );
}
