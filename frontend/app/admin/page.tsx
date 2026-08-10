"use client";

import Link from "next/link";

const MODULES = [
  {
    href: "/admin/announcements",
    title: "公告欄",
    desc: "停課通知、招生開放、比賽戰報。釘選的會出現在首頁與公告頁最上方。",
    color: "bg-coral-200",
  },
  {
    href: "/admin/cards",
    title: "卡片內容",
    desc: "編輯首頁、給家長頁、給小朋友頁、報名頁的所有區塊文字 (FAQ / 效益 / 步驟…)。",
    color: "bg-sun-200",
  },
  {
    href: "/admin/courses",
    title: "課程",
    desc: "新增 / 修改 / 隱藏分班與課程介紹。",
    color: "bg-sky2-100",
  },
  {
    href: "/admin/teachers",
    title: "師資",
    desc: "編輯老師簡介、上傳大頭照、調整顯示順序。",
    color: "bg-mint-200",
  },
  {
    href: "/admin/gallery",
    title: "相簿",
    desc: "上傳活動 / 比賽 / 教室照片，前台首頁 Bento 與相簿頁會自動顯示。",
    color: "bg-sky2-200",
  },
  {
    href: "/admin/blog",
    title: "部落格",
    desc: "撰寫教學心得、活動回顧文章。",
    color: "bg-grape-200",
  },
  {
    href: "/admin/settings",
    title: "全站設定",
    desc: "教室名稱、電話、地址、報名表單連結、SEO 設定。",
    color: "bg-cream-100",
  },
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">
        歡迎回來 👋
      </h1>
      <p className="mt-2 text-ink-soft">
        選一個區塊開始修改 — 所有變更會即時同步到網站前台。
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`group relative overflow-hidden rounded-[1.75rem] ${m.color} p-6 shadow-pop transition-transform hover:-translate-y-1 hover:-rotate-[0.5deg]`}
          >
            <h3 className="font-display text-xl font-bold text-ink">{m.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.desc}</p>
            <p className="mt-4 text-sm font-bold text-ink underline-offset-4 group-hover:underline">
              進入 →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
