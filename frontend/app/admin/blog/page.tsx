"use client";

import { useEffect, useState } from "react";

import { Btn, Field, Toast, inputCls, textareaCls } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { adminGet, adminSend } from "@/lib/admin";
import type { BlogPost } from "@/lib/types";

type PostForm = Omit<BlogPost, "id" | "created_at" | "updated_at">;

const emptyPost = (): PostForm => ({
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  tags: [],
  author: "",
  published: false,
  published_at: null,
});

export default function BlogAdminPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await adminGet<BlogPost[]>("/api/v1/blog/all");
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

  async function del(p: BlogPost) {
    if (!confirm(`刪除「${p.title}」？`)) return;
    try {
      await adminSend("DELETE", `/api/v1/blog/${p.id}`);
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
          <h1 className="font-display text-3xl font-bold text-ink">部落格</h1>
          <p className="mt-1 text-sm text-ink-soft">教學心得、活動回顧。</p>
        </div>
        <Btn onClick={() => setEditing("new")}>+ 新文章</Btn>
      </header>

      {editing === "new" && (
        <PostFormCard
          post={emptyPost()}
          onCancel={() => setEditing(null)}
          onSave={async (payload) => {
            await adminSend("POST", "/api/v1/blog", payload);
            notify("已新增");
            setEditing(null);
            await refresh();
          }}
        />
      )}

      <ul className="mt-6 space-y-3">
        {loading && <p className="text-ink-soft">載入中…</p>}
        {items.length === 0 && !loading && (
          <p className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-8 text-center text-ink-soft">
            還沒有任何文章。
          </p>
        )}
        {items.map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border-2 border-cream-200 bg-white shadow-pop-sm"
          >
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${
                  p.published
                    ? "bg-mint-200 text-mint-800"
                    : "bg-cream-200 text-ink-soft"
                }`}
              >
                {p.published ? "PUB" : "—"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold text-ink">
                  {p.title}
                </p>
                <p className="truncate text-xs text-ink-soft">
                  {p.author ?? "—"} · {p.tags.join(", ") || "—"}
                </p>
              </div>
              <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[10px] font-mono">
                {p.slug}
              </span>
              <Btn
                variant="ghost"
                onClick={() => setEditing(editing === p.id ? null : p.id)}
              >
                {editing === p.id ? "收起" : "編輯"}
              </Btn>
              <Btn variant="danger" onClick={() => del(p)}>
                刪除
              </Btn>
            </div>
            {editing === p.id && (
              <PostFormCard
                post={p}
                onCancel={() => setEditing(null)}
                onSave={async (payload) => {
                  await adminSend("PATCH", `/api/v1/blog/${p.id}`, payload);
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

function PostFormCard({
  post,
  onCancel,
  onSave,
}: {
  post: PostForm | BlogPost;
  onCancel: () => void;
  onSave: (payload: Partial<PostForm>) => Promise<void>;
}) {
  const [form, setForm] = useState<PostForm>({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    cover_image_url: post.cover_image_url ?? "",
    tags: post.tags ?? [],
    author: post.author ?? "",
    published: post.published ?? false,
    published_at: post.published_at ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function update<K extends keyof PostForm>(k: K, v: PostForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const clean: Record<string, unknown> = { ...form };
      for (const k of ["excerpt", "cover_image_url", "author"]) {
        if (clean[k] === "") clean[k] = null;
      }
      // 第一次發佈時自動補 published_at
      if (form.published && !form.published_at) {
        clean.published_at = new Date().toISOString();
      }
      await onSave(clean as Partial<PostForm>);
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
        <Field label="封面圖">
          <ImagePicker
            value={form.cover_image_url}
            onChange={(url) => update("cover_image_url", url)}
            aspect="aspect-[16/10]"
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
        <Field label="作者">
          <input
            value={form.author ?? ""}
            onChange={(e) => update("author", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="標題" required>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputCls + " md:col-span-2"}
          />
        </Field>
        <Field label="摘要">
          <textarea
            value={form.excerpt ?? ""}
            onChange={(e) => update("excerpt", e.target.value)}
            className={textareaCls + " md:col-span-2"}
            rows={2}
          />
        </Field>
        <Field label="內文 (Markdown 或純文字)">
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            className={textareaCls + " md:col-span-2"}
            rows={10}
          />
        </Field>
        <Field label="標籤" hint="用逗號分隔">
          <input
            value={form.tags.join(", ")}
            onChange={(e) =>
              update(
                "tags",
                e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              )
            }
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 self-end text-sm font-bold text-ink">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
            className="h-4 w-4"
          />
          公開發佈
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
