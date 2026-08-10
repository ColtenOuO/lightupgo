"use client";

import { useEffect, useState } from "react";

import { Btn, Field, Toast, inputCls, textareaCls } from "@/components/admin/AdminShell";
import { adminGet, adminSend } from "@/lib/admin";
import type { Announcement } from "@/lib/types";

type AnnForm = Omit<Announcement, "id" | "created_at" | "updated_at">;

const emptyAnn = (): AnnForm => ({
  title: "",
  body: "",
  tag: "",
  link_url: "",
  link_text: "",
  pinned: false,
  published: true,
  published_at: new Date().toISOString().slice(0, 16), // datetime-local 格式
  expires_at: null,
  order: 0,
});

const TAG_OPTIONS = ["公告", "招生", "比賽", "活動", "停課"];

function fmtDT(s: string | null): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  // 轉成本地時區的 datetime-local 字串
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AnnouncementsAdminPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await adminGet<Announcement[]>("/api/v1/announcements/all");
      setItems(data);
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : "讀取失敗", kind: "err" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function notify(msg: string, kind: "ok" | "err" = "ok") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2500);
  }

  async function del(a: Announcement) {
    if (!confirm(`刪除「${a.title}」？`)) return;
    try {
      await adminSend("DELETE", `/api/v1/announcements/${a.id}`);
      notify("已刪除");
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "刪除失敗", "err");
    }
  }

  async function quick(a: Announcement, patch: Partial<Announcement>) {
    try {
      await adminSend("PATCH", `/api/v1/announcements/${a.id}`, patch);
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "更新失敗", "err");
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">公告欄</h1>
          <p className="mt-1 text-sm text-ink-soft">
            停課通知、招生開放、比賽戰報。釘選的會出現在最上方。
          </p>
        </div>
        <Btn onClick={() => setEditing("new")}>+ 新增公告</Btn>
      </header>

      {editing === "new" && (
        <AnnFormCard
          ann={emptyAnn()}
          onCancel={() => setEditing(null)}
          onSave={async (payload) => {
            await adminSend("POST", "/api/v1/announcements", payload);
            notify("已新增");
            setEditing(null);
            await refresh();
          }}
        />
      )}

      <ul className="mt-6 space-y-3">
        {loading && <p className="text-ink-soft">載入中…</p>}
        {!loading && items.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-8 text-center text-ink-soft">
            還沒有公告。
          </p>
        )}
        {items.map((a) => (
          <li
            key={a.id}
            className={`rounded-2xl border-2 ${
              a.pinned ? "border-coral-300 bg-coral-50" : "border-cream-200 bg-white"
            } ${a.published ? "" : "opacity-60"} shadow-pop-sm`}
          >
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:gap-3">
              {a.pinned && (
                <span className="inline-grid h-6 w-9 -rotate-6 place-items-center rounded-md bg-coral-500 text-[10px] font-bold text-white shadow-pop-sm">
                  PIN
                </span>
              )}
              {a.tag && (
                <span className="rounded-full bg-sun-200 px-2 py-0.5 text-[11px] font-bold text-ink">
                  {a.tag}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold text-ink">
                  {a.title}
                </p>
                {a.body && (
                  <p className="truncate text-xs text-ink-soft">{a.body}</p>
                )}
              </div>
              <button
                onClick={() => quick(a, { pinned: !a.pinned })}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  a.pinned
                    ? "bg-coral-200 text-coral-700 hover:bg-coral-100"
                    : "bg-cream-200 text-ink-soft hover:bg-cream-100"
                }`}
                title="釘選 / 取消釘選"
              >
                {a.pinned ? "已釘選" : "釘選"}
              </button>
              <button
                onClick={() => quick(a, { published: !a.published })}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  a.published
                    ? "bg-mint-200 text-mint-700 hover:bg-mint-100"
                    : "bg-cream-200 text-ink-soft hover:bg-cream-100"
                }`}
              >
                {a.published ? "公開" : "已下架"}
              </button>
              <Btn variant="ghost" onClick={() => setEditing(editing === a.id ? null : a.id)}>
                {editing === a.id ? "收起" : "編輯"}
              </Btn>
              <Btn variant="danger" onClick={() => del(a)}>
                刪除
              </Btn>
            </div>
            {editing === a.id && (
              <AnnFormCard
                ann={a}
                onCancel={() => setEditing(null)}
                onSave={async (payload) => {
                  await adminSend("PATCH", `/api/v1/announcements/${a.id}`, payload);
                  notify("已儲存");
                  setEditing(null);
                  await refresh();
                }}
              />
            )}
          </li>
        ))}
      </ul>

      <Toast msg={toast?.msg ?? null} kind={toast?.kind} />
    </div>
  );
}

function AnnFormCard({
  ann,
  onCancel,
  onSave,
}: {
  ann: AnnForm | Announcement;
  onCancel: () => void;
  onSave: (payload: Partial<AnnForm>) => Promise<void>;
}) {
  const [form, setForm] = useState<AnnForm>({
    title: ann.title,
    body: ann.body ?? "",
    tag: ann.tag ?? "",
    link_url: ann.link_url ?? "",
    link_text: ann.link_text ?? "",
    pinned: ann.pinned ?? false,
    published: ann.published ?? true,
    published_at: fmtDT(ann.published_at as string | null) || null,
    expires_at: fmtDT(ann.expires_at as string | null) || null,
    order: ann.order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function update<K extends keyof AnnForm>(k: K, v: AnnForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const clean: Record<string, unknown> = { ...form };
      for (const k of ["body", "tag", "link_url", "link_text"]) {
        if (clean[k] === "") clean[k] = null;
      }
      // 把 datetime-local 字串轉成 ISO（後端 datetime 接受）
      for (const k of ["published_at", "expires_at"]) {
        const v = clean[k];
        if (typeof v === "string" && v) {
          clean[k] = new Date(v).toISOString();
        } else if (v === "" || v === undefined) {
          clean[k] = null;
        }
      }
      await onSave(clean as Partial<AnnForm>);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 border-t-2 border-cream-200 bg-cream-50 p-4 sm:grid-cols-2"
    >
      <Field label="標題" required>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputCls + " sm:col-span-2"}
        />
      </Field>
      <Field label="標籤" hint="預設五種，可自訂">
        <input
          value={form.tag ?? ""}
          onChange={(e) => update("tag", e.target.value)}
          list="ann-tags"
          className={inputCls}
        />
        <datalist id="ann-tags">
          {TAG_OPTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </Field>

      <Field label="內文">
        <textarea
          value={form.body ?? ""}
          onChange={(e) => update("body", e.target.value)}
          className={textareaCls + " sm:col-span-2"}
          rows={3}
        />
      </Field>

      <Field label="按鈕連結網址" hint="例如 /register、/gallery，留空就沒按鈕">
        <input
          value={form.link_url ?? ""}
          onChange={(e) => update("link_url", e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="按鈕文字" hint="預設「詳細資訊」">
        <input
          value={form.link_text ?? ""}
          onChange={(e) => update("link_text", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="發佈時間" hint="可預定未來時間，到時候才會出現">
        <input
          type="datetime-local"
          value={
            typeof form.published_at === "string"
              ? form.published_at.replace("Z", "").slice(0, 16)
              : ""
          }
          onChange={(e) => update("published_at", e.target.value || null)}
          className={inputCls}
        />
      </Field>
      <Field label="自動下架時間" hint="到期後自動隱藏，留空表示不過期">
        <input
          type="datetime-local"
          value={
            typeof form.expires_at === "string"
              ? form.expires_at.replace("Z", "").slice(0, 16)
              : ""
          }
          onChange={(e) => update("expires_at", e.target.value || null)}
          className={inputCls}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm font-bold text-ink">
        <input
          type="checkbox"
          checked={form.pinned}
          onChange={(e) => update("pinned", e.target.checked)}
          className="h-4 w-4"
        />
        釘選到最上方
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-ink">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
          className="h-4 w-4"
        />
        公開發佈
      </label>

      {err && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-700 sm:col-span-2">
          {err}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Btn type="submit" disabled={saving}>
          {saving ? "儲存中…" : "儲存"}
        </Btn>
        <Btn type="button" variant="ghost" onClick={onCancel}>
          取消
        </Btn>
      </div>
    </form>
  );
}
