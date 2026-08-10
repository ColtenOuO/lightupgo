"use client";

import { useEffect, useState } from "react";

import { Btn, Field, Toast, inputCls, textareaCls } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { adminGet, adminSend } from "@/lib/admin";
import type { Course } from "@/lib/types";

type CourseForm = Omit<Course, "id" | "created_at" | "updated_at">;

const emptyCourse = (): CourseForm => ({
  slug: "",
  name: "",
  level: "beginner",
  description: "",
  age_range: "",
  duration: "",
  schedule: "",
  price: "",
  image_url: "",
  features: [],
  order: 0,
  visible: true,
});

export default function CoursesAdminPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await adminGet<Course[]>("/api/v1/courses?visible_only=false");
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

  async function del(c: Course) {
    if (!confirm(`刪除課程「${c.name}」？`)) return;
    try {
      await adminSend("DELETE", `/api/v1/courses/${c.id}`);
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
          <h1 className="font-display text-3xl font-bold text-ink">課程</h1>
          <p className="mt-1 text-sm text-ink-soft">
            分班課程，前台首頁 Bento「我們的課」與 /courses 都會用到。
          </p>
        </div>
        <Btn onClick={() => setEditing("new")}>+ 新增課程</Btn>
      </header>

      {editing === "new" && (
        <CourseFormCard
          course={emptyCourse()}
          onCancel={() => setEditing(null)}
          onSave={async (payload) => {
            await adminSend("POST", "/api/v1/courses", payload);
            notify("已新增");
            setEditing(null);
            await refresh();
          }}
        />
      )}

      <ul className="mt-6 space-y-3">
        {loading && <p className="text-ink-soft">載入中…</p>}
        {items.map((c) => (
          <li
            key={c.id}
            className={`rounded-2xl border-2 border-cream-200 ${c.visible ? "bg-white" : "bg-cream-100 opacity-60"} shadow-pop-sm`}
          >
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="text-xs font-mono text-ink-soft">
                {String(c.order).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-ink">{c.name}</p>
                <p className="text-xs text-ink-soft">
                  {c.age_range ?? c.level} · {c.duration ?? "—"} · {c.schedule ?? "—"}
                </p>
              </div>
              <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[10px] font-mono">
                {c.slug}
              </span>
              <Btn variant="ghost" onClick={() => setEditing(editing === c.id ? null : c.id)}>
                {editing === c.id ? "收起" : "編輯"}
              </Btn>
              <Btn variant="danger" onClick={() => del(c)}>
                刪除
              </Btn>
            </div>
            {editing === c.id && (
              <CourseFormCard
                course={c}
                onCancel={() => setEditing(null)}
                onSave={async (payload) => {
                  await adminSend("PATCH", `/api/v1/courses/${c.id}`, payload);
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

function CourseFormCard({
  course,
  onCancel,
  onSave,
}: {
  course: CourseForm | Course;
  onCancel: () => void;
  onSave: (payload: Partial<CourseForm>) => Promise<void>;
}) {
  const [form, setForm] = useState<CourseForm>({
    slug: course.slug,
    name: course.name,
    level: course.level,
    description: course.description ?? "",
    age_range: course.age_range ?? "",
    duration: course.duration ?? "",
    schedule: course.schedule ?? "",
    price: course.price ?? "",
    image_url: course.image_url ?? "",
    features: course.features ?? [],
    order: course.order ?? 0,
    visible: course.visible ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function update<K extends keyof CourseForm>(k: K, v: CourseForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const clean: Record<string, unknown> = { ...form };
      for (const k of ["description", "age_range", "duration", "schedule", "price", "image_url"]) {
        if (clean[k] === "") clean[k] = null;
      }
      await onSave(clean as Partial<CourseForm>);
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
        <Field label="課程縮圖">
          <ImagePicker
            value={form.image_url}
            onChange={(url) => update("image_url", url)}
            aspect="aspect-[4/3]"
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
        <Field label="課程名稱" required>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="級別" hint="beginner / advanced / rank">
          <input
            value={form.level}
            onChange={(e) => update("level", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="年齡 / 程度">
          <input
            value={form.age_range ?? ""}
            onChange={(e) => update("age_range", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="時長">
          <input
            value={form.duration ?? ""}
            onChange={(e) => update("duration", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="時段">
          <input
            value={form.schedule ?? ""}
            onChange={(e) => update("schedule", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="學費" hint="可寫範圍或自由文字">
          <input
            value={form.price ?? ""}
            onChange={(e) => update("price", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="描述">
          <textarea
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            className={textareaCls + " md:col-span-2"}
          />
        </Field>

        <Field label="課程特色" hint="一行一項">
          <textarea
            value={(form.features ?? []).join("\n")}
            onChange={(e) =>
              update(
                "features",
                e.target.value
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean),
              )
            }
            className={textareaCls + " md:col-span-2"}
          />
        </Field>

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
