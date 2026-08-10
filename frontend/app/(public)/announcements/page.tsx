import Link from "next/link";

import { Glyph, HoshiCluster } from "@/components/public/glyph";
import { apiGet } from "@/lib/api";
import type { Announcement } from "@/lib/types";

export const metadata = {
  title: "公告欄",
};

async function getAll(): Promise<Announcement[]> {
  try {
    return await apiGet<Announcement[]>("/api/v1/announcements");
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

const TAG_COLOR: Record<string, string> = {
  招生: "bg-coral-200 text-coral-800",
  比賽: "bg-sun-200 text-sun-900",
  停課: "bg-grape-200 text-grape-600",
  活動: "bg-mint-200 text-mint-800",
  公告: "bg-sky2-200 text-sky2-700",
};

export default async function AnnouncementsPage() {
  const items = await getAll();
  const pinned = items.filter((a) => a.pinned);
  const others = items.filter((a) => !a.pinned);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-coral-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-mint-200 right-[-6rem] top-12" />

        <div className="container-page relative py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-coral-200 px-4 py-1.5 text-sm font-bold tracking-wider text-coral-700 shadow-pop-sm">
            <HoshiCluster className="h-3 w-3" />
            BULLETIN BOARD
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            最新<br />
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-sun-300" />
              消息與公告
            </span>
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            停課通知、招生開放、比賽戰報、活動公告。
          </p>
        </div>
      </section>

      {/* 內容 */}
      <section className="container-page space-y-8 py-8">
        {items.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center text-ink-soft">
            目前還沒有公告。
          </p>
        )}

        {pinned.length > 0 && (
          <div>
            <h2 className="mb-3 inline-flex items-center gap-2 font-display text-base font-bold tracking-wider text-coral-700">
              <span className="inline-grid h-5 w-5 -rotate-12 place-items-center rounded-md bg-coral-500 text-[10px] font-bold text-white">
                PIN
              </span>
              釘選公告
            </h2>
            <ul className="space-y-3">
              {pinned.map((a) => (
                <AnnouncementCard key={a.id} a={a} highlight />
              ))}
            </ul>
          </div>
        )}

        {others.length > 0 && (
          <div>
            {pinned.length > 0 && (
              <h2 className="mb-3 font-display text-base font-bold tracking-wider text-mint-700">
                LATEST
              </h2>
            )}
            <ul className="space-y-3">
              {others.map((a) => (
                <AnnouncementCard key={a.id} a={a} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="h-32" />
    </>
  );
}

function AnnouncementCard({ a, highlight }: { a: Announcement; highlight?: boolean }) {
  const tagCls = a.tag ? TAG_COLOR[a.tag] ?? "bg-cream-200 text-ink-soft" : null;
  return (
    <li
      className={`relative overflow-hidden rounded-[1.5rem] border-2 ${
        highlight ? "border-coral-300 bg-coral-50" : "border-cream-200 bg-white"
      } p-5 shadow-pop-sm transition-transform hover:-translate-y-0.5 md:p-6`}
    >
      {a.pinned && (
        <span className="absolute right-4 top-4 grid h-7 w-7 -rotate-12 place-items-center rounded-md bg-coral-500 text-[10px] font-bold text-white shadow-pop-sm">
          PIN
        </span>
      )}
      <div className="flex flex-wrap items-baseline gap-2">
        {a.tag && tagCls && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tagCls}`}>
            {a.tag}
          </span>
        )}
        {a.published_at && (
          <span className="font-mono text-xs text-ink-soft">
            {fmtDate(a.published_at)}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-display text-xl font-bold text-ink md:text-2xl">
        {a.title}
      </h3>
      {a.body && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft md:text-base">
          {a.body}
        </p>
      )}
      {a.link_url && (
        <Link
          href={a.link_url}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-cream-100 hover:bg-ink/90"
        >
          {a.link_text ?? "詳細資訊"}
          <Glyph name="arrow" size={14} />
        </Link>
      )}
    </li>
  );
}
