import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Glyph } from "@/components/public/glyph";
import { apiGet, resolveImageUrl } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

type Props = {
  params: { slug: string };
};

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiGet<BlogPost>(`/api/v1/blog/by-slug/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

async function getOthers(): Promise<BlogPost[]> {
  try {
    return await apiGet<BlogPost[]>("/api/v1/blog?published_only=true&limit=6");
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const p = await getPost(params.slug);
  if (!p) return { title: "文章不存在" };
  return {
    title: p.title,
    description: p.excerpt ?? p.title,
    openGraph: {
      title: p.title,
      description: p.excerpt ?? undefined,
      images: p.cover_image_url
        ? [{ url: resolveImageUrl(p.cover_image_url) ?? p.cover_image_url }]
        : undefined,
    },
  };
}

function fmtDate(s: string | null): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 把純文字 / 輕量 markdown 轉成 JSX：
 * - `## 標題` → h2
 * - `### 標題` → h3
 * - `> 引用` → blockquote
 * - 連續空行視為段落分隔
 * - 段落內單行換行保留為 <br />
 */
function renderContent(text: string) {
  const blocks: React.ReactNode[] = [];
  const paragraphs = text.split(/\n{2,}/);
  paragraphs.forEach((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2
          key={i}
          className="relative mt-10 font-display text-2xl font-bold text-ink md:text-3xl"
        >
          <span className="absolute -left-4 -top-1 text-coral-300">●</span>
          {trimmed.slice(3).trim()}
        </h2>,
      );
      return;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={i} className="mt-8 font-display text-xl font-bold text-ink">
          {trimmed.slice(4).trim()}
        </h3>,
      );
      return;
    }
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={i}
          className="my-6 rounded-2xl border-l-4 border-coral-400 bg-coral-50 px-5 py-3 text-ink-soft"
        >
          {trimmed.slice(2)}
        </blockquote>,
      );
      return;
    }

    // 一般段落：保留行內 <br />
    const lines = trimmed.split(/\n/);
    blocks.push(
      <p
        key={i}
        className="leading-loose text-ink"
      >
        {lines.map((ln, j) => (
          <span key={j}>
            {ln}
            {j < lines.length - 1 && <br />}
          </span>
        ))}
      </p>,
    );
  });
  return blocks;
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const cover = resolveImageUrl(post.cover_image_url);
  const all = await getOthers();
  const others = all.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-grape-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-sun-200 right-[-6rem] top-12" />

        <div className="container-page relative pt-10 md:pt-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-soft shadow-pop-sm hover:bg-cream-100"
          >
            ← 回文章列表
          </Link>
          <div className="mt-6 flex flex-wrap items-baseline gap-2">
            {post.published_at && (
              <span className="font-mono text-sm text-ink-soft">
                {fmtDate(post.published_at)}
              </span>
            )}
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-sun-200 px-2.5 py-0.5 text-xs font-bold text-ink"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-ink md:text-5xl">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-3 text-sm font-bold text-mint-700">— {post.author}</p>
          )}
        </div>
      </section>

      {/* 封面 */}
      {cover && (
        <section className="container-page mt-8">
          <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-pop md:p-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem]">
              <Image
                src={cover}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 95vw, 1024px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* 內文 */}
      <article className="container-page mt-10">
        <div className="mx-auto max-w-3xl">
          {post.excerpt && (
            <p className="mb-8 rounded-2xl bg-cream-100 px-5 py-4 text-lg font-bold leading-relaxed text-ink md:text-xl">
              {post.excerpt}
            </p>
          )}
          <div className="space-y-5">{renderContent(post.content)}</div>
        </div>
      </article>

      {/* 內文後 CTA */}
      <section className="container-page mt-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-coral-200 p-7 text-center md:p-10">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            想讓孩子也來下棋嗎？
          </h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            兩個班別目前開放線上報名，第一節免費試聽。
          </p>
          <Link
            href="/register"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display font-bold text-cream-100 shadow-pop hover:-rotate-1 active:translate-y-1"
          >
            最新課程報名
            <Glyph name="arrow" />
          </Link>
        </div>
      </section>

      {/* 其他文章 */}
      {others.length > 0 && (
        <section className="container-page mt-12">
          <h2 className="font-display text-2xl font-bold text-ink">其他文章</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {others.map((p, i) => {
              const c = resolveImageUrl(p.cover_image_url);
              return (
                <li key={p.id}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className={`group block rounded-[1.5rem] bg-white p-2.5 shadow-pop-sm transition-transform hover:-translate-y-1 ${i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1"}`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-cream-100">
                      {c && (
                        <Image
                          src={c}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 90vw, 30vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 font-display text-sm font-bold text-ink">
                        {p.title}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="h-32" />
    </>
  );
}
