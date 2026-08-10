"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearToken, getToken } from "@/lib/admin";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/announcements", label: "公告欄" },
  { href: "/admin/cards", label: "卡片內容" },
  { href: "/admin/courses", label: "課程" },
  { href: "/admin/teachers", label: "師資" },
  { href: "/admin/gallery", label: "相簿" },
  { href: "/admin/blog", label: "部落格" },
  { href: "/admin/settings", label: "全站設定" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoginPage = path === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }
    if (!getToken()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [path, router, isLoginPage]);

  // 切換頁面時自動關閉 mobile 抽屜
  useEffect(() => {
    setDrawerOpen(false);
  }, [path]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-200 text-ink-soft">
        載入中…
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream-200">
      {/* 手機頂部 bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-sun-300/40 bg-white px-4 py-3 shadow-pop-sm lg:hidden">
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-cream-100"
          aria-label="開啟選單"
        >
          {drawerOpen ? "✕" : "≡"}
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink">
            <span className="h-3 w-3 rounded-full border-2 border-cream-100 bg-cream-100" />
          </span>
          <span className="font-display text-base font-bold text-ink">立光後台</span>
        </Link>
      </header>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* 桌面版 sidebar / 手機版抽屜 */}
        <aside
          className={`${
            drawerOpen ? "block" : "hidden"
          } border-b-2 border-cream-200 bg-white p-5 lg:sticky lg:top-0 lg:block lg:h-screen lg:border-b-0 lg:border-r-4 lg:border-sun-300/40`}
        >
          <Link
            href="/admin"
            className="hidden items-center gap-3 lg:flex"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-cream-100">
              <span className="h-4 w-4 rounded-full border-2 border-cream-100 bg-cream-100" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base font-bold text-ink">立光後台</p>
              <p className="text-xs text-mint-700">老師專用</p>
            </div>
          </Link>

          <nav className="flex flex-col gap-1 lg:mt-6">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? path === "/admin"
                  : path?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "bg-coral-500 text-white shadow-pop-coral"
                      : "text-ink hover:bg-sun-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t-2 border-cream-200 pt-4">
            <Link
              href="/"
              target="_blank"
              className="block rounded-lg px-3 py-2 text-xs font-bold text-ink-soft hover:bg-cream-200"
            >
              ↗ 看公開網站
            </Link>
            <button
              onClick={logout}
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-coral-700 hover:bg-coral-50"
            >
              登出
            </button>
          </div>
        </aside>

        {/* 主內容區 */}
        <main className="min-w-0">
          <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── 共用表單元件 ─────────────────────────────────────

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex flex-wrap items-baseline gap-x-2 text-sm font-bold text-ink">
        {label}
        {required && <span className="text-coral-600">*</span>}
        {hint && <span className="text-xs font-normal text-ink-soft">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "block w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2 text-sm text-ink shadow-pop-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-300";

export const textareaCls = inputCls + " resize-y min-h-[6rem]";

export function Btn({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "mint";
}) {
  const styles = {
    primary:
      "bg-coral-500 text-white shadow-pop-coral hover:bg-coral-400 active:translate-y-0.5",
    mint: "bg-mint-500 text-white shadow-pop-sm hover:bg-mint-400 active:translate-y-0.5",
    ghost:
      "bg-white text-ink border-2 border-cream-200 hover:bg-cream-100",
    danger:
      "bg-white text-coral-700 border-2 border-coral-200 hover:bg-coral-50",
  };
  return (
    <button
      {...props}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all disabled:opacity-50 sm:text-sm ${styles[variant]} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Toast({
  msg,
  kind = "ok",
}: {
  msg: string | null;
  kind?: "ok" | "err";
}) {
  if (!msg) return null;
  const cls =
    kind === "ok"
      ? "bg-mint-200 text-mint-800"
      : "bg-coral-200 text-coral-800";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 font-bold shadow-pop ${cls}`}
    >
      {msg}
    </div>
  );
}
