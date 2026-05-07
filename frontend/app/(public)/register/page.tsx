import Link from "next/link";

import { apiGet } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export const metadata = {
  title: "免費試聽報名",
};

async function getSettings(): Promise<SiteSettings | null> {
  try {
    return await apiGet<SiteSettings>("/api/v1/settings", { revalidate: 60 });
  } catch {
    return null;
  }
}

export default async function RegisterPage() {
  const settings = await getSettings();
  const formUrl = settings?.register_form_url?.trim();
  const note =
    settings?.register_form_note ??
    "報名連結整理中，敬請期待，或來電預約：" + (settings?.phone ?? "");

  return (
    <section className="container-page py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
          免費試聽報名
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          填寫下方表單後，我們會在 1–2 個工作天內聯繫您安排試聽時段。
        </p>

        {formUrl ? (
          <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-pop">
            <iframe
              title="免費試聽報名表"
              src={formUrl}
              className="h-[1100px] w-full"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mt-10 rounded-3xl bg-cream-100 p-8 shadow-pop">
            <div className="text-2xl">🎯</div>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink">
              表單整理中
            </h2>
            <p className="mt-2 text-ink-soft">{note}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center rounded-full bg-coral-500 px-6 py-3 font-display font-bold text-white shadow-pop-coral hover:bg-coral-400 active:translate-y-1"
                >
                  撥打 {settings.phone}
                </a>
              )}
              <Link
                href="/courses"
                className="inline-flex items-center rounded-full border-2 border-ink/20 bg-white px-6 py-3 font-display font-bold text-ink hover:bg-cream-200"
              >
                先看課程介紹
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
