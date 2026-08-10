import Image from "next/image";
import Link from "next/link";

import { Glyph, HoshiCluster } from "@/components/public/glyph";
import { apiGet, resolveImageUrl } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

export const metadata = {
  title: "部落格",
};

async function getPosts(): Promise<BlogPost[]> {
  try {
    return await apiGet<BlogPost[]>("/api/v1/blog?published_only=true&limit=100");
  } catch {
    return [];
  }
}

function fmtDate(s: string | null): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default async function BlogIndexPage() {
  const posts = await getPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-grape-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-sun-200 right-[-6rem] top-12" />

        <div className="container-page relative py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-grape-200 px-4 py-1.5 text-sm font-bold tracking-wider text-grape-600 shadow-pop-sm">
            <HoshiCluster className="h-3 w-3" />
            BLOG
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            老師的<br />
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-sun-300" />
              心得 & 學員故事
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            從教學現場、孩子的進步、比賽紀錄，到下棋這件事的思考。
          </p>
        </div>
      </section>

      {/* 內容 */}
      <section className="container-page space-y-10 pb-8">
        {posts.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center text-ink-soft">
            還沒有任何文章。
          </p>
        ) : (
          <>
            {/* 主打文：第一篇大張 */}
            {featured && (
              <FeaturedCard post={featured} />
            )}

            {/* 其餘：grid */}
            {rest.length > 0 && (
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <li key={p.id}>
                    <PostCard post={p} index={i} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <div className="h-32" />
    </>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const cover = resolveImageUrl(post.cover_image_url);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-6 rounded-[2rem] bg-white p-3 shadow-pop transition-transform hover:-translate-y-1 md:grid-cols-2 md:p-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-cream-100">
        {cover ? (
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 95vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-soft">無封面</div>
        )}
        <span className="absolute left-4 top-4 inline-grid h-8 w-16 -rotate-6 place-items-center rounded-lg bg-coral-500 text-[10px] font-bold tracking-wider text-white shadow-pop-sm">
          FEATURED
        </span>
      </div>

      <div className="flex flex-col justify-center p-4 md:p-6">
        <div className="flex flex-wrap items-baseline gap-2">
          {post.published_at && (
            <span className="font-mono text-xs text-ink-soft">
              {fmtDate(post.published_at)}
            </span>
          )}
          {post.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-sun-200 px-2 py-0.5 text-[11px] font-bold text-ink"
            >
              {t}
            </span>
          ))}
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink md:text-4xl">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>
        )}
        {post.author && (
          <p className="mt-4 text-sm font-bold text-mint-700">— {post.author}</p>
        )}
        <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream-100 group-hover:bg-ink/90">
          閱讀全文
          <Glyph name="arrow" size={14} />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const cover = resolveImageUrl(post.cover_image_url);
  const tilt = index % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block rounded-[1.75rem] bg-white p-2.5 shadow-pop-sm transition-transform hover:-translate-y-1 ${tilt}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-cream-100">
        {cover ? (
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 90vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-soft">無封面</div>
        )}
      </div>
      <div className="p-3">
        <div className="flex flex-wrap items-baseline gap-2">
          {post.published_at && (
            <span className="font-mono text-xs text-ink-soft">
              {fmtDate(post.published_at)}
            </span>
          )}
          {post.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-bold text-ink"
            >
              {t}
            </span>
          ))}
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-ink">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
