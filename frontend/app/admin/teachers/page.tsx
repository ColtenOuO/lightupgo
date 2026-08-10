"use client";

import { useEffect, useState } from "react";

import { Btn, Field, Toast, inputCls, textareaCls } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { adminGet, adminSend } from "@/lib/admin";
import type { Teacher } from "@/lib/types";

type TeacherForm = Omit<Teacher, "id" | "created_at" | "updated_at">;

const emptyTeacher = (): TeacherForm => ({
  slug: "",
  name: "",
  title: "",
  rank: "",
  bio: "",
  avatar_url: "",
  achievements: [],
  order: 0,
  visible: true,
});

export default function TeachersAdminPage() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await adminGet<Teacher[]>("/api/v1/teachers?visible_only=false");
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

  async function del(t: Teacher) {
    if (!confirm(`刪除「${t.name}」？`)) return;
    try {
      await adminSend("DELETE", `/api/v1/teachers/${t.id}`);
      notify("已刪除");
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "刪除失敗", "err");
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">師資</h1>
          <p className="mt-1 text-sm text-ink-soft">老師簡介、大頭照、戰績。</p>
        </div>
        <Btn onClick={() => setEditing("new")}>+ 新增老師</Btn>
      </header>

      {editing === "new" && (
        <TeacherFormCard
          teacher={emptyTeacher()}
          onCancel={() => setEditing(null)}
          onSave={async (payload) => {
            await adminSend("POST", "/api/v1/teachers", payload);
            notify("已新增");
            setEditing(null);
            await refresh();
          }}
        />
      )}

      <ul className="mt-6 space-y-3">
        {loading && <p className="text-ink-soft">載入中…</p>}
        {items.map((t) => (
          <li
            key={t.id}
            className={`rounded-2xl border-2 border-cream-200 ${t.visible ? "bg-white" : "bg-cream-100 opacity-60"} shadow-pop-sm`}
          >
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="text-xs font-mono text-ink-soft">
                {String(t.order).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-ink">{t.name}</p>
                <p className="text-xs text-ink-soft">
                  {t.title ?? "—"} · {t.rank ?? "—"}
                </p>
              </div>
              <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[10px] font-mono">
                {t.slug}
              </span>
              <Btn variant="ghost" onClick={() => setEditing(editing === t.id ? null : t.id)}>
                {editing === t.id ? "收起" : "編輯"}
              </Btn>
              <Btn variant="danger" onClick={() => del(t)}>
                刪除
              </Btn>
            </div>
            {editing === t.id && (
              <TeacherFormCard
                teacher={t}
                onCancel={() => setEditing(null)}
                onSave={async (payload) => {
                  await adminSend("PATCH", `/api/v1/teachers/${t.id}`, payload);
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

function TeacherFormCard({
  teacher,
  onCancel,
  onSave,
}: {
  teacher: TeacherForm | Teacher;
  onCancel: () => void;
  onSave: (payload: Partial<TeacherForm>) => Promise<void>;
}) {
  const [form, setForm] = useState<TeacherForm>({
    slug: teacher.slug,
    name: teacher.name,
    title: teacher.title ?? "",
    rank: teacher.rank ?? "",
    bio: teacher.bio ?? "",
    avatar_url: teacher.avatar_url ?? "",
    achievements: teacher.achievements ?? [],
    extras: teacher.extras ?? {},
    order: teacher.order ?? 0,
    visible: teacher.visible ?? true,
  });
  const [extrasText, setExtrasText] = useState(
    JSON.stringify(teacher.extras ?? {}, null, 2),
  );
  const [extrasError, setExtrasError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function update<K extends keyof TeacherForm>(k: K, v: TeacherForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    // 先驗證 extras JSON
    let extrasParsed: Record<string, unknown> = {};
    try {
      const parsed = extrasText.trim() ? JSON.parse(extrasText) : {};
      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        throw new Error("最外層必須是 { } 物件");
      }
      extrasParsed = parsed as Record<string, unknown>;
      setExtrasError("");
    } catch (e) {
      setExtrasError(e instanceof Error ? e.message : "JSON 格式錯誤");
      setSaving(false);
      return;
    }
    try {
      const clean: Record<string, unknown> = { ...form, extras: extrasParsed };
      for (const k of ["title", "rank", "bio", "avatar_url"]) {
        if (clean[k] === "") clean[k] = null;
      }
      await onSave(clean as Partial<TeacherForm>);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 border-t-2 border-cream-200 bg-cream-50 p-4 md:grid-cols-3"
    >
      <div className="md:col-span-1">
        <Field label="大頭照">
          <ImagePicker
            value={form.avatar_url}
            onChange={(url) => update("avatar_url", url)}
          />
        </Field>
      </div>

      <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
        <Field label="slug" required>
          <input
            required
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="order">
          <input
            type="number"
            value={form.order}
            onChange={(e) => update("order", Number(e.target.value) || 0)}
            className={inputCls}
          />
        </Field>
        <Field label="姓名" required>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="頭銜">
          <input
            value={form.title ?? ""}
            onChange={(e) => update("title", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="段位" hint="例如 業餘 6 段">
          <input
            value={form.rank ?? ""}
            onChange={(e) => update("rank", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="顯示順序 (與 order 一樣)">
          <input
            type="number"
            value={form.order}
            onChange={(e) => update("order", Number(e.target.value) || 0)}
            className={inputCls}
          />
        </Field>

        <Field label="自我介紹">
          <textarea
            value={form.bio ?? ""}
            onChange={(e) => update("bio", e.target.value)}
            className={textareaCls + " md:col-span-2"}
          />
        </Field>

        <Field label="主要成績清單 (一行一項)" hint="顯示在首頁師資 / 公開師資頁 fallback">
          <textarea
            value={(form.achievements ?? []).join("\n")}
            onChange={(e) =>
              update(
                "achievements",
                e.target.value
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean),
              )
            }
            className={textareaCls + " md:col-span-2"}
          />
        </Field>

        <Field
          label="進階資料 (JSON)"
          hint="教學理念 / 教學經歷 / 比賽戰績 / 學歷 / 聯絡方式等結構化內容；前台 /teachers 會自動渲染"
        >
          <textarea
            value={extrasText}
            onChange={(e) => setExtrasText(e.target.value)}
            className={textareaCls + " md:col-span-2 font-mono text-xs leading-relaxed"}
            rows={14}
            spellCheck={false}
          />
        </Field>
        {extrasError && (
          <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-700 md:col-span-2">
            JSON 錯誤：{extrasError}
          </p>
        )}
        <details className="rounded-xl bg-cream-100 px-3 py-2 text-xs text-ink-soft md:col-span-2">
          <summary className="cursor-pointer font-bold text-ink">
            進階資料可以填哪些 key？（範例）
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{`{
  "online_rank": "野狐網路圍棋 9 段",
  "taiwan_amateur_ranking": 38,
  "education": { "university": "...", "department": "..." },
  "contact": { "facebook": "...", "line": "...", "email": "..." },
  "teaching_philosophy": ["第一句", "第二句"],
  "teaching_experience": [
    { "year": "2025–", "organization": "立光圍棋教室", "role": "創辦" }
  ],
  "competition_awards": [
    { "year": "2025", "note": "可選", "awards": ["XX 盃 冠軍", "YY 賽 亞軍"] }
  ],
  "other_experience": [
    { "year": 2022, "event": "雙城盃" }
  ]
}`}</pre>
        </details>

        <label className="flex items-center gap-2 text-sm font-bold text-ink md:col-span-2">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => update("visible", e.target.checked)}
            className="h-4 w-4"
          />
          前台顯示
        </label>

        {err && (
          <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-700 md:col-span-2">
            {err}
          </p>
        )}

        <div className="flex gap-2 md:col-span-2">
          <Btn type="submit" disabled={saving}>
            {saving ? "儲存中…" : "儲存"}
          </Btn>
          <Btn type="button" variant="ghost" onClick={onCancel}>
            取消
          </Btn>
        </div>
      </div>
    </form>
  );
}
