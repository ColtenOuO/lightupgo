"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Btn, Field, Toast, inputCls } from "@/components/admin/AdminShell";
import { adminGet, adminSend, imageSrc, uploadImage } from "@/lib/admin";
import type { GalleryItem } from "@/lib/types";

/**
 * 相簿管理：
 * - 列出全部照片（grid 縮圖）
 * - 支援多檔批次上傳
 * - 點縮圖編輯標題 / 分類 / 排序 / 顯示
 */
export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await adminGet<GalleryItem[]>("/api/v1/gallery?visible_only=false");
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

  const categories = useMemo(
    () => Array.from(new Set(items.map((g) => g.category).filter(Boolean) as string[])).sort(),
    [items],
  );

  const visible = useMemo(
    () => items.filter((g) => !filter || g.category === filter),
    [items, filter],
  );

  async function onBatchUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    let ok = 0;
    try {
      for (const f of files) {
        const { url } = await uploadImage(f);
        await adminSend("POST", "/api/v1/gallery", {
          image_url: url,
          title: f.name.replace(/\.[^.]+$/, ""),
          category: filter || "其他",
          order: items.length + ok,
        });
        ok++;
      }
      notify(`已上傳 ${ok} 張`);
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "上傳失敗", "err");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function del(g: GalleryItem) {
    if (!confirm(`刪除「${g.title ?? g.image_url}」？`)) return;
    try {
      await adminSend("DELETE", `/api/v1/gallery/${g.id}`);
      notify("已刪除");
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "刪除失敗", "err");
    }
  }

  async function save(g: GalleryItem, patch: Partial<GalleryItem>) {
    try {
      await adminSend("PATCH", `/api/v1/gallery/${g.id}`, patch);
      notify("已儲存");
      setEditing(null);
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "儲存失敗", "err");
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">相簿</h1>
          <p className="mt-1 text-sm text-ink-soft">
            上傳活動 / 比賽 / 教室照片。前台首頁 Bento「上課現場」與 /gallery 都會顯示。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={onBatchUpload}
            className="hidden"
          />
          <Btn onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "上傳中…" : "+ 批次上傳"}
          </Btn>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border-2 border-cream-200 bg-white p-4 shadow-pop-sm">
        <Field label="分類">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={inputCls}
          >
            <option value="">全部</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-sm font-bold text-ink-soft">
          {visible.length} / {items.length} 張
        </p>
        <p className="ml-auto text-xs text-ink-soft">
          ※ 批次上傳會帶入目前篩選的分類（沒選就是「其他」）
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && <p className="text-ink-soft">載入中…</p>}
        {visible.map((g) => {
          const src = imageSrc(g.image_url);
          const isEditing = editing === g.id;
          return (
            <div
              key={g.id}
              className={`rounded-2xl border-2 ${g.visible ? "border-cream-200 bg-white" : "border-cream-200 bg-cream-100 opacity-60"} overflow-hidden shadow-pop-sm`}
            >
              <div className="relative aspect-[4/3] bg-cream-100">
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={g.title ?? ""} className="h-full w-full object-cover" />
                )}
                <span className="absolute right-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold text-cream-100">
                  {g.category ?? "—"}
                </span>
              </div>
              <div className="p-3">
                {isEditing ? (
                  <EditForm g={g} categories={categories} onCancel={() => setEditing(null)} onSave={(p) => save(g, p)} />
                ) : (
                  <>
                    <p className="line-clamp-1 font-display text-sm font-bold text-ink">
                      {g.title ?? "(無標題)"}
                    </p>
                    <p className="line-clamp-2 text-xs text-ink-soft">{g.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Btn variant="ghost" onClick={() => setEditing(g.id)}>
                        編輯
                      </Btn>
                      <Btn variant="ghost" onClick={() => save(g, { visible: !g.visible })}>
                        {g.visible ? "隱藏" : "顯示"}
                      </Btn>
                      <Btn variant="danger" onClick={() => del(g)}>
                        刪除
                      </Btn>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Toast msg={toast?.msg ?? null} kind={toast?.kind} />
    </div>
  );
}

function EditForm({
  g,
  categories,
  onCancel,
  onSave,
}: {
  g: GalleryItem;
  categories: string[];
  onCancel: () => void;
  onSave: (patch: Partial<GalleryItem>) => void;
}) {
  const [title, setTitle] = useState(g.title ?? "");
  const [desc, setDesc] = useState(g.description ?? "");
  const [cat, setCat] = useState(g.category ?? "");
  const [order, setOrder] = useState(g.order);

  return (
    <div className="space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="標題"
        className={inputCls + " text-sm"}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="說明"
        rows={2}
        className={inputCls + " text-sm"}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          list="gallery-categories"
          placeholder="分類"
          className={inputCls + " text-sm"}
        />
        <datalist id="gallery-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) || 0)}
          placeholder="排序"
          className={inputCls + " text-sm"}
        />
      </div>
      <div className="flex gap-1.5">
        <Btn
          onClick={() =>
            onSave({
              title: title || null,
              description: desc || null,
              category: cat || null,
              order,
            })
          }
        >
          儲存
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>
          取消
        </Btn>
      </div>
    </div>
  );
}
