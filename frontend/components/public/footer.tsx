import Link from "next/link";

import { Glyph } from "@/components/public/glyph";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="relative mt-16 bg-ink pb-8 pt-16 text-cream-200">
      {/* 浮在 Footer 頂端的 CTA 卡 */}
      <div className="container-page -mt-32 mb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-sun-400 p-8 text-center shadow-pop-lg md:p-12">
          {/* 旋轉幾何貼紙 */}
          <span className="absolute left-6 top-6 inline-block h-10 w-10 rotate-12 rounded-2xl bg-coral-300" />
          <span className="absolute right-8 top-10 inline-block h-7 w-7 rounded-full bg-mint-300 animate-bounce-soft" />
          <span className="absolute bottom-6 left-12 inline-block h-8 w-8 -rotate-12 rounded-xl bg-sky2-300" />
          <span className="absolute bottom-10 right-10 inline-block h-5 w-5 rounded-full border-4 border-coral-400" />

          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            想試一節嗎？
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-ink/80 md:text-base">
            老師會根據孩子的年齡與經驗安排合適的試聽班別。
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-display text-base font-bold text-cream-100 shadow-pop hover:-rotate-1 hover:bg-ink/90 active:translate-y-1"
          >
            預約免費試聽
            <Glyph name="arrow" />
          </Link>
        </div>
      </div>

      <div className="container-page grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun-400 text-ink">
              <span className="h-5 w-5 rounded-full bg-ink" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-bold text-sun-300">
                {settings.site_name}
              </h3>
              <p className="text-sm text-cream-200/80">{settings.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream-200/70">
            陪伴每一個孩子在棋盤上找到自己的節奏。從第一顆棋子開始，慢慢長出專注、思考與勇氣。
          </p>
        </div>

        <div className="text-sm">
          <h4 className="font-display text-base font-bold text-mint-300">
            認識我們
          </h4>
          <ul className="mt-3 space-y-1.5 text-cream-200/80">
            <li>
              <Link href="/for-parents" className="hover:text-sun-100">
                給家長
              </Link>
            </li>
            <li>
              <Link href="/for-kids" className="hover:text-sun-100">
                給小朋友
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-sun-100">
                課程介紹
              </Link>
            </li>
            <li>
              <Link href="/teachers" className="hover:text-sun-100">
                師資陣容
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-sun-100">
                學習部落格
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h4 className="font-display text-base font-bold text-coral-300">
            聯絡我們
          </h4>
          <ul className="mt-3 space-y-2 text-cream-200/80">
            {settings.phone && (
              <li className="flex items-center gap-2">
                <Glyph name="phone" className="text-coral-300" size={16} />
                <a
                  href={`tel:${settings.phone}`}
                  className="text-sun-200 hover:text-sun-100"
                >
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2">
                <Glyph name="pin" className="mt-0.5 text-coral-300" size={16} />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.business_hours && (
              <li className="flex items-start gap-2">
                <Glyph name="clock" className="mt-0.5 text-coral-300" size={16} />
                <span>{settings.business_hours}</span>
              </li>
            )}
            {settings.line_id && <li>LINE：{settings.line_id}</li>}
          </ul>
        </div>
      </div>

      <div className="container-page mt-12 border-t border-cream-200/10 pt-6 text-center text-xs text-cream-200/60">
        © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
      </div>
    </footer>
  );
}
