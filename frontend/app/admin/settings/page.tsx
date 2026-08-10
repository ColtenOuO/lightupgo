"use client";

import { useEffect, useState } from "react";

import { Btn, Field, Toast, inputCls, textareaCls } from "@/components/admin/AdminShell";
import { adminGet, adminSend } from "@/lib/admin";
import type { SiteSettings } from "@/lib/types";

export default function SettingsAdminPage() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminGet<SiteSettings>("/api/v1/settings");
        setForm(data);
      } catch (e) {
        setToast({ msg: e instanceof Error ? e.message : "讀取失敗", kind: "err" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      // 把字串欄位空字串轉成 null（meta_keywords 是陣列，不動）
      const clean: Record<string, unknown> = { ...form };
      for (const k of [
        "hero_subtitle",
        "phone",
        "address",
        "business_hours",
        "map_url",
        "register_form_url",
        "register_form_note",
        "meta_description",
        "facebook_url",
        "instagram_url",
        "line_id",
        "youtube_url",
      ]) {
        if (clean[k] === "") clean[k] = null;
      }
      const updated = await adminSend<SiteSettings>("PATCH", "/api/v1/settings", clean);
      setForm(updated);
      setToast({ msg: "已儲存", kind: "ok" });
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : "儲存失敗", kind: "err" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  if (loading || !form) {
    return <p className="text-ink-soft">載入中…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">全站設定</h1>
      <p className="mt-1 text-sm text-ink-soft">
        教室名稱、電話、地址、社群連結、SEO 等等。
      </p>

      <form onSubmit={submit} className="mt-6 max-w-3xl space-y-6">
        <section className="rounded-2xl border-2 border-cream-200 bg-white p-5 shadow-pop-sm">
          <h2 className="font-display text-lg font-bold text-ink">基本資訊</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="教室名稱" required>
              <input
                required
                value={form.site_name}
                onChange={(e) => update("site_name", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="主標語" required>
              <input
                required
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Hero 副標 (首頁大標題下方)">
              <input
                value={form.hero_subtitle ?? ""}
                onChange={(e) => update("hero_subtitle", e.target.value)}
                className={inputCls + " sm:col-span-2"}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-cream-200 bg-white p-5 shadow-pop-sm">
          <h2 className="font-display text-lg font-bold text-ink">聯絡資訊</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="電話">
              <input
                value={form.phone ?? ""}
                onChange={(e) => update("phone", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="LINE ID">
              <input
                value={form.line_id ?? ""}
                onChange={(e) => update("line_id", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="地址">
              <input
                value={form.address ?? ""}
                onChange={(e) => update("address", e.target.value)}
                className={inputCls + " sm:col-span-2"}
              />
            </Field>
            <Field label="營業時間">
              <input
                value={form.business_hours ?? ""}
                onChange={(e) => update("business_hours", e.target.value)}
                className={inputCls + " sm:col-span-2"}
              />
            </Field>
            <Field
              label="Google Maps 連結"
              hint="貼上 share.google / maps.app.goo.gl / maps.google.com 都可；/location 頁的「在 Google Maps 開啟」按鈕會用這個"
            >
              <input
                value={form.map_url ?? ""}
                onChange={(e) => update("map_url", e.target.value)}
                placeholder="https://share.google/..."
                className={inputCls + " sm:col-span-2"}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-cream-200 bg-white p-5 shadow-pop-sm">
          <h2 className="font-display text-lg font-bold text-ink">報名表單</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="表單網址 (Google Form 等)" hint="留空時前台會顯示 fallback 訊息">
              <input
                value={form.register_form_url ?? ""}
                onChange={(e) => update("register_form_url", e.target.value)}
                className={inputCls + " sm:col-span-2"}
              />
            </Field>
            <Field label="表單未提供時的說明文字">
              <textarea
                value={form.register_form_note ?? ""}
                onChange={(e) => update("register_form_note", e.target.value)}
                className={textareaCls + " sm:col-span-2"}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-cream-200 bg-white p-5 shadow-pop-sm">
          <h2 className="font-display text-lg font-bold text-ink">社群連結</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Facebook">
              <input
                value={form.facebook_url ?? ""}
                onChange={(e) => update("facebook_url", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Instagram">
              <input
                value={form.instagram_url ?? ""}
                onChange={(e) => update("instagram_url", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="YouTube">
              <input
                value={form.youtube_url ?? ""}
                onChange={(e) => update("youtube_url", e.target.value)}
                className={inputCls + " sm:col-span-2"}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-cream-200 bg-white p-5 shadow-pop-sm">
          <h2 className="font-display text-lg font-bold text-ink">SEO</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Meta description">
              <textarea
                value={form.meta_description ?? ""}
                onChange={(e) => update("meta_description", e.target.value)}
                className={textareaCls}
                rows={3}
              />
            </Field>
            <Field label="Meta keywords" hint="用逗號分隔">
              <input
                value={(form.meta_keywords ?? []).join(", ")}
                onChange={(e) =>
                  update(
                    "meta_keywords",
                    e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  )
                }
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        <Btn type="submit" disabled={saving}>
          {saving ? "儲存中…" : "儲存全部設定"}
        </Btn>
      </form>

      <Toast msg={toast?.msg ?? null} kind={toast?.kind} />
    </div>
  );
}
