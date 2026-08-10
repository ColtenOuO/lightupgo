"use client";

import { useEffect, useMemo, useState } from "react";

import { Btn, Field, Toast, inputCls, textareaCls } from "@/components/admin/AdminShell";
import { adminGet, adminSend } from "@/lib/admin";
import {
  KNOWN_LOCATIONS,
  locationLabel,
  pageLabel,
  sectionDescription,
  sectionLabel,
} from "@/lib/card-sections";
import type { Card as CardData } from "@/lib/types";

/**
 * 卡片 (Card) 管理：
 * - 按「位置」（page + section）分組顯示，每組標題用友善名稱
 * - 每組底下都有「+ 新增到這裡」按鈕，自動帶入 page / section
 * - 頂部「+ 新增卡片」可選擇任意已知位置或自訂
 * - 「進階：自訂 page / section」摺疊起來，預設只給選單
 */

type EmptyCard = Omit<CardData, "id" | "created_at" | "updated_at">;

const emptyCard = (page = "home", section = "hero"): EmptyCard => ({
  slug: "",
  page,
  section,
  order: 0,
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  icon: "",
  cta_text: "",
  cta_url: "",
  extras: {},
  visible: true,
});

type EditingState =
  | null
  | { kind: "edit"; id: string }
  | { kind: "new"; page?: string; section?: string };

export default function CardsAdminPage() {
  const [items, setItems] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoc, setFilterLoc] = useState<string>(""); // "page::section" 或 ""
  const [editing, setEditing] = useState<EditingState>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await adminGet<CardData[]>("/api/v1/cards/all");
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

  // 全部位置（已知 + 資料庫裡有但沒列在 KNOWN_LOCATIONS 的）
  const allLocations = useMemo(() => {
    const set = new Set<string>();
    for (const k of KNOWN_LOCATIONS) set.add(`${k.page}::${k.section}`);
    for (const c of items) set.add(`${c.page}::${c.section}`);
    return Array.from(set).sort((a, b) => {
      // 已知位置排前面，按 KNOWN_LOCATIONS 的順序
      const ai = KNOWN_LOCATIONS.findIndex((k) => `${k.page}::${k.section}` === a);
      const bi = KNOWN_LOCATIONS.findIndex((k) => `${k.page}::${k.section}` === b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b);
    });
  }, [items]);

  const visible = useMemo(() => {
    if (!filterLoc) return items;
    const [p, s] = filterLoc.split("::");
    return items.filter((c) => c.page === p && c.section === s);
  }, [items, filterLoc]);

  // 依位置分組
  const grouped = useMemo(() => {
    const m = new Map<string, CardData[]>();
    for (const c of visible) {
      const key = `${c.page}::${c.section}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(c);
    }
    for (const list of m.values()) {
      list.sort((a, b) => a.order - b.order);
    }
    // 排序：跟 allLocations 一樣
    return Array.from(m.entries()).sort(([a], [b]) => {
      const ai = allLocations.indexOf(a);
      const bi = allLocations.indexOf(b);
      return ai - bi;
    });
  }, [visible, allLocations]);

  async function toggleVisible(c: CardData) {
    try {
      await adminSend("PATCH", `/api/v1/cards/${c.id}`, { visible: !c.visible });
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "更新失敗", "err");
    }
  }

  async function deleteCard(c: CardData) {
    if (!confirm(`真的要刪除「${c.title ?? c.slug}」？`)) return;
    try {
      await adminSend("DELETE", `/api/v1/cards/${c.id}`);
      notify("已刪除");
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "刪除失敗", "err");
    }
  }

  async function move(c: CardData, dir: -1 | 1) {
    const sib = items
      .filter((x) => x.page === c.page && x.section === c.section)
      .sort((a, b) => a.order - b.order);
    const idx = sib.findIndex((x) => x.id === c.id);
    const swap = sib[idx + dir];
    if (!swap) return;
    try {
      await adminSend("POST", "/api/v1/cards/reorder", [
        { id: c.id, order: swap.order },
        { id: swap.id, order: c.order },
      ]);
      await refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "排序失敗", "err");
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">卡片內容</h1>
          <p className="mt-1 text-sm text-ink-soft">
            前台所有區塊（首頁 hero、FAQ、步驟…）的文字、圖片都在這裡管理。
          </p>
        </div>
        <Btn onClick={() => setEditing({ kind: "new" })}>+ 新增卡片</Btn>
      </header>

      {/* 篩選 — 用單一「位置」下拉 */}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border-2 border-cream-200 bg-white p-4 shadow-pop-sm">
        <Field label="顯示位置">
          <select
            value={filterLoc}
            onChange={(e) => setFilterLoc(e.target.value)}
            className={inputCls + " min-w-[16rem]"}
          >
            <option value="">全部位置</option>
            {allLocations.map((loc) => {
              const [p, s] = loc.split("::");
              return (
                <option key={loc} value={loc}>
                  {pageLabel(p)} · {sectionLabel(p, s)}
                </option>
              );
            })}
          </select>
        </Field>
        <p className="text-sm font-bold text-ink-soft">
          共 {visible.length} 筆 / 全部 {items.length} 筆
        </p>
      </div>

      {/* 頂部 新增表單 */}
      {editing?.kind === "new" && !editing.section && (
        <CardForm
          card={emptyCard()}
          onCancel={() => setEditing(null)}
          onSave={async (payload) => {
            await adminSend("POST", "/api/v1/cards", payload);
            notify("已新增");
            setEditing(null);
            await refresh();
          }}
        />
      )}

      {/* 列表 — 依位置分組 */}
      <div className="mt-6 space-y-8">
        {loading ? (
          <p className="text-ink-soft">載入中…</p>
        ) : grouped.length === 0 ? (
          <p className="text-ink-soft">沒有符合的卡片。</p>
        ) : (
          grouped.map(([loc, list]) => {
            const [page, section] = loc.split("::");
            const desc = sectionDescription(page, section);
            return (
              <section key={loc}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold text-ink">
                      <span className="text-mint-700">{pageLabel(page)}</span>
                      <span className="mx-2 text-ink-soft">›</span>
                      {sectionLabel(page, section)}
                      <span className="ml-2 font-sans text-xs font-bold text-ink-soft">
                        {list.length} 筆
                      </span>
                    </h2>
                    {desc && <p className="text-xs text-ink-soft">{desc}</p>}
                  </div>
                  <Btn
                    variant="ghost"
                    onClick={() =>
                      setEditing({ kind: "new", page, section })
                    }
                  >
                    + 新增到這裡
                  </Btn>
                </div>

                {/* 該組的新增表單 */}
                {editing?.kind === "new" &&
                  editing.page === page &&
                  editing.section === section && (
                    <CardForm
                      card={emptyCard(page, section)}
                      lockLocation
                      onCancel={() => setEditing(null)}
                      onSave={async (payload) => {
                        await adminSend("POST", "/api/v1/cards", payload);
                        notify("已新增");
                        setEditing(null);
                        await refresh();
                      }}
                    />
                  )}

                <ul className="space-y-2">
                  {list.map((c, idx) => {
                    const isEditingThis =
                      editing?.kind === "edit" && editing.id === c.id;
                    return (
                      <li
                        key={c.id}
                        className={`rounded-2xl border-2 ${c.visible ? "border-cream-200 bg-white" : "border-cream-200 bg-cream-100 opacity-60"} shadow-pop-sm`}
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-1 shrink-0 text-xs font-mono text-ink-soft">
                              {String(c.order).padStart(2, "0")}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-display text-base font-bold text-ink">
                                {c.title || c.slug}
                              </p>
                              {c.body && (
                                <p className="line-clamp-1 text-xs text-ink-soft">
                                  {c.body}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 md:mt-3 md:gap-2">
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => move(c, -1)}
                                disabled={idx === 0}
                                className="grid h-7 w-7 place-items-center rounded-lg text-ink-soft hover:bg-cream-200 disabled:opacity-30"
                                title="往上"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => move(c, 1)}
                                disabled={idx === list.length - 1}
                                className="grid h-7 w-7 place-items-center rounded-lg text-ink-soft hover:bg-cream-200 disabled:opacity-30"
                                title="往下"
                              >
                                ↓
                              </button>
                            </div>
                            <button
                              onClick={() => toggleVisible(c)}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                c.visible
                                  ? "bg-mint-200 text-mint-700 hover:bg-mint-100"
                                  : "bg-cream-200 text-ink-soft hover:bg-cream-100"
                              }`}
                            >
                              {c.visible ? "顯示中" : "已隱藏"}
                            </button>
                            <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-mono text-ink-soft">
                              {c.slug}
                            </span>
                            <span className="flex-1" />
                            <Btn
                              variant="ghost"
                              onClick={() =>
                                setEditing(
                                  isEditingThis
                                    ? null
                                    : { kind: "edit", id: c.id },
                                )
                              }
                            >
                              {isEditingThis ? "收起" : "編輯"}
                            </Btn>
                            <Btn variant="danger" onClick={() => deleteCard(c)}>
                              刪除
                            </Btn>
                          </div>
                        </div>

                        {isEditingThis && (
                          <CardForm
                            card={c}
                            lockLocation
                            onCancel={() => setEditing(null)}
                            onSave={async (payload) => {
                              await adminSend("PATCH", `/api/v1/cards/${c.id}`, payload);
                              notify("已儲存");
                              setEditing(null);
                              await refresh();
                            }}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>

      <Toast msg={toast?.msg ?? null} kind={toast?.kind} />
    </div>
  );
}

// ── 卡片表單 ────────────────────────────────────────

function CardForm({
  card,
  lockLocation,
  onCancel,
  onSave,
}: {
  card: EmptyCard | CardData;
  /** 若為 true：page/section 鎖住不能改（避免老師誤改） */
  lockLocation?: boolean;
  onCancel: () => void;
  onSave: (payload: Partial<EmptyCard>) => Promise<void>;
}) {
  const [form, setForm] = useState<EmptyCard>({
    slug: card.slug,
    page: card.page,
    section: card.section,
    order: card.order ?? 0,
    title: card.title ?? "",
    subtitle: card.subtitle ?? "",
    body: card.body ?? "",
    image_url: card.image_url ?? "",
    icon: card.icon ?? "",
    cta_text: card.cta_text ?? "",
    cta_url: card.cta_url ?? "",
    extras: card.extras ?? {},
    visible: card.visible ?? true,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function update<K extends keyof EmptyCard>(k: K, v: EmptyCard[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function updateLocation(locKey: string) {
    const [p, s] = locKey.split("::");
    setForm((f) => ({ ...f, page: p, section: s }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const clean = { ...form } as Record<string, unknown>;
      for (const k of ["title", "subtitle", "body", "image_url", "icon", "cta_text", "cta_url"]) {
        if (clean[k] === "") clean[k] = null;
      }
      // 沒填 slug 的話自動生個
      if (!clean.slug) {
        clean.slug = `${form.page}_${form.section}_${Date.now().toString(36)}`;
      }
      await onSave(clean as Partial<EmptyCard>);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  const currentLoc = `${form.page}::${form.section}`;

  return (
    <form
      onSubmit={submit}
      className="mt-3 grid gap-3 rounded-2xl border-2 border-cream-200 bg-cream-50 p-4 sm:grid-cols-2"
    >
      {/* 位置選單（沒鎖時才顯示） */}
      {!lockLocation && (
        <Field
          label="放在哪個位置"
          required
          hint="選擇一個前台的區塊；找不到時可在下方「進階」自填"
        >
          <select
            value={currentLoc}
            onChange={(e) => updateLocation(e.target.value)}
            className={inputCls + " sm:col-span-2"}
          >
            {KNOWN_LOCATIONS.map((k) => (
              <option key={`${k.page}::${k.section}`} value={`${k.page}::${k.section}`}>
                {locationLabel(k.page, k.section)}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="標題">
        <input
          value={form.title ?? ""}
          onChange={(e) => update("title", e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="副標">
        <input
          value={form.subtitle ?? ""}
          onChange={(e) => update("subtitle", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="內文" hint="支援多行文字">
        <textarea
          value={form.body ?? ""}
          onChange={(e) => update("body", e.target.value)}
          className={textareaCls + " sm:col-span-2"}
        />
      </Field>

      <Field label="順序" hint="同位置內，數字越小越前面">
        <input
          type="number"
          value={form.order}
          onChange={(e) => update("order", Number(e.target.value) || 0)}
          className={inputCls}
        />
      </Field>
      <label className="flex items-center gap-2 self-end text-sm font-bold text-ink">
        <input
          type="checkbox"
          checked={form.visible}
          onChange={(e) => update("visible", e.target.checked)}
          className="h-4 w-4"
        />
        前台顯示
      </label>

      {/* 按鈕（CTA） */}
      <Field label="按鈕文字 (CTA)">
        <input
          value={form.cta_text ?? ""}
          onChange={(e) => update("cta_text", e.target.value)}
          placeholder="例如「立即報名」"
          className={inputCls}
        />
      </Field>
      <Field label="按鈕連結 (CTA URL)">
        <input
          value={form.cta_url ?? ""}
          onChange={(e) => update("cta_url", e.target.value)}
          placeholder="例如 /register 或 https://forms.gle/..."
          className={inputCls}
        />
      </Field>

      {/* 進階：圖示 / 圖片 / slug / 自訂 page-section */}
      <details
        open={showAdvanced}
        onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
        className="rounded-xl bg-white px-3 py-2 sm:col-span-2"
      >
        <summary className="cursor-pointer text-sm font-bold text-ink-soft">
          進階設定（icon / 圖片 / slug / 自訂位置）
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field
            label="圖示 (icon)"
            hint="可填棋盤圖樣：black / white / pair / enclose / hoshi / knight / line / jump / scatter / shape / sansan / twin"
          >
            <input
              value={form.icon ?? ""}
              onChange={(e) => update("icon", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="圖片網址" hint="從相簿上傳後可貼路徑">
            <input
              value={form.image_url ?? ""}
              onChange={(e) => update("image_url", e.target.value)}
              placeholder="/uploads/2026/05/xxx.jpg"
              className={inputCls}
            />
          </Field>
          <Field label="識別代號 (slug)" hint="留空會自動產生">
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              className={inputCls}
            />
          </Field>
          {!lockLocation && (
            <Field label="自訂 page · section" hint="只有要做新區塊時才填">
              <div className="flex gap-2">
                <input
                  value={form.page}
                  onChange={(e) => update("page", e.target.value)}
                  placeholder="page"
                  className={inputCls}
                />
                <input
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                  placeholder="section"
                  className={inputCls}
                />
              </div>
            </Field>
          )}
        </div>
      </details>

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
