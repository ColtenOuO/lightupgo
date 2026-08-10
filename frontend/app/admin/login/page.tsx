"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Btn, Field, inputCls } from "@/components/admin/AdminShell";
import { adminLogin } from "@/lib/admin";

export default function LoginPage() {
  const router = useRouter();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await adminLogin(u, p);
      router.replace("/admin");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream-200 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-pop-lg"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-cream-100 shadow-pop-sm">
            <span className="h-5 w-5 rounded-full border-2 border-cream-100 bg-cream-100" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">立光後台</h1>
            <p className="text-sm text-mint-700">老師專用管理介面</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="帳號" required>
            <input
              className={inputCls}
              value={u}
              onChange={(e) => setU(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </Field>
          <Field label="密碼" required>
            <input
              type="password"
              className={inputCls}
              value={p}
              onChange={(e) => setP(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
        </div>

        {err && (
          <p className="mt-4 rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-700">
            {err}
          </p>
        )}

        <Btn type="submit" disabled={loading} className="mt-6 w-full justify-center">
          {loading ? "登入中…" : "登入"}
        </Btn>

        <p className="mt-4 text-center text-xs text-ink-soft">
          忘記密碼？請聯絡網站管理員。
        </p>
      </form>
    </div>
  );
}
