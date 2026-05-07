import Link from "next/link";

import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 bg-ink py-12 text-cream-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-sun-300">
            {settings.site_name}
          </h3>
          <p className="mt-2 text-sm text-cream-200/80">{settings.tagline}</p>
        </div>

        <div className="text-sm">
          <h4 className="font-display text-base font-bold text-mint-300">
            聯絡我們
          </h4>
          <ul className="mt-3 space-y-1 text-cream-200/80">
            {settings.phone && (
              <li>
                電話：
                <a
                  href={`tel:${settings.phone}`}
                  className="text-sun-200 hover:text-sun-100"
                >
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.address && <li>地址：{settings.address}</li>}
            {settings.business_hours && <li>時間：{settings.business_hours}</li>}
          </ul>
        </div>

        <div className="text-sm">
          <h4 className="font-display text-base font-bold text-mint-300">
            連結
          </h4>
          <ul className="mt-3 space-y-1 text-cream-200/80">
            <li>
              <Link href="/courses" className="hover:text-sun-100">
                課程介紹
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-sun-100">
                免費試聽報名
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-sun-100">
                部落格
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-cream-200/10 px-4 pt-6 text-center text-xs text-cream-200/60">
        © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
      </div>
    </footer>
  );
}
