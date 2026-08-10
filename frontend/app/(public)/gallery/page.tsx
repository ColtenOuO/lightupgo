import Image from "next/image";
import Link from "next/link";

import { Glyph, HoshiCluster } from "@/components/public/glyph";
import { apiGet, resolveImageUrl } from "@/lib/api";
import type { GalleryItem } from "@/lib/types";

export const metadata = {
  title: "相簿",
};

async function getAll(): Promise<GalleryItem[]> {
  try {
    return await apiGet<GalleryItem[]>("/api/v1/gallery");
  } catch {
    return [];
  }
}

const CATEGORY_LABEL: Record<string, string> = {
  classroom: "教室現場",
  competition: "比賽紀錄",
  trip: "出隊出遊",
};

const CATEGORY_TONE: Record<string, string> = {
  classroom: "bg-mint-200 text-mint-800",
  competition: "bg-coral-200 text-coral-800",
  trip: "bg-sky2-200 text-sky2-700",
};

type Props = {
  searchParams?: { cat?: string };
};

export default async function GalleryPage({ searchParams }: Props) {
  const all = await getAll();
  const selected = searchParams?.cat ?? "";

  // 用 Map 保持原本 order，但建出 category 列表
  const categories = Array.from(
    new Set(all.map((g) => g.category).filter(Boolean) as string[]),
  );

  const filtered = selected
    ? all.filter((g) => g.category === selected)
    : all;

  // 依分類分組
  const groups = new Map<string, GalleryItem[]>();
  for (const g of filtered) {
    const k = g.category ?? "其他";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(g);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-sky2-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-sun-200 right-[-6rem] top-12" />

        <div className="container-page relative py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky2-200 px-4 py-1.5 text-sm font-bold tracking-wider text-sky2-700 shadow-pop-sm">
            <HoshiCluster className="h-3 w-3" />
            GALLERY
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            活動<br />
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-sun-300" />
              相簿
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            教室上課現場、比賽戰報、出隊集合 — 孩子們的日常都在這裡。
          </p>

          {/* 分類 chip */}
          {categories.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                href="/gallery"
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  selected === ""
                    ? "bg-ink text-cream-100 shadow-pop-sm"
                    : "bg-white text-ink hover:bg-cream-100"
                }`}
              >
                全部（{all.length}）
              </Link>
              {categories.map((c) => {
                const count = all.filter((g) => g.category === c).length;
                const active = selected === c;
                const tone = CATEGORY_TONE[c] ?? "bg-cream-200 text-ink-soft";
                return (
                  <Link
                    key={c}
                    href={`/gallery?cat=${encodeURIComponent(c)}`}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                      active
                        ? "bg-ink text-cream-100 shadow-pop-sm"
                        : `${tone} hover:opacity-80`
                    }`}
                  >
                    {CATEGORY_LABEL[c] ?? c}（{count}）
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 照片 */}
      <section className="container-page space-y-12 pb-8">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center text-ink-soft">
            這個分類還沒有照片。
          </p>
        ) : (
          Array.from(groups.entries()).map(([cat, items]) => (
            <div key={cat}>
              {!selected && (
                <h2 className="mb-5 inline-flex items-center gap-2 font-display text-xl font-bold text-ink md:text-2xl">
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold tracking-wider ${
                      CATEGORY_TONE[cat] ?? "bg-cream-200 text-ink-soft"
                    }`}
                  >
                    {(cat || "").toUpperCase()}
                  </span>
                  {CATEGORY_LABEL[cat] ?? cat}
                  <span className="font-sans text-sm font-bold text-ink-soft">
                    {items.length} 張
                  </span>
                </h2>
              )}

              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {items.map((g, i) => {
                  const url = resolveImageUrl(g.image_url);
                  if (!url) return null;
                  return (
                    <li
                      key={g.id}
                      className={`group relative overflow-hidden rounded-[1.25rem] bg-white p-1.5 shadow-pop-sm transition-transform hover:-translate-y-1 ${
                        i % 4 === 0
                          ? "hover:-rotate-1"
                          : i % 4 === 1
                            ? "hover:rotate-1"
                            : i % 4 === 2
                              ? "hover:-rotate-[0.5deg]"
                              : "hover:rotate-[0.5deg]"
                      }`}
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-[1rem]">
                          <Image
                            src={url}
                            alt={g.title ?? ""}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        {(g.title || g.description) && (
                          <div className="px-2 pb-2 pt-2.5">
                            {g.title && (
                              <p className="line-clamp-1 font-display text-sm font-bold text-ink">
                                {g.title}
                              </p>
                            )}
                            {g.description && (
                              <p className="line-clamp-2 text-[11px] leading-relaxed text-ink-soft">
                                {g.description}
                              </p>
                            )}
                          </div>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* CTA */}
      <section className="container-page py-12">
        <div className="rounded-[2rem] bg-coral-200 p-8 text-center md:p-10">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            想成為這裡的一員嗎？
          </h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            免費試聽 60 分鐘，老師會帶你的孩子玩第一節課。
          </p>
          <Link
            href="/register"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 font-display font-bold text-cream-100 shadow-pop hover:-rotate-1 active:translate-y-1"
          >
            預約試聽
            <Glyph name="arrow" />
          </Link>
        </div>
      </section>

      <div className="h-32" />
    </>
  );
}
