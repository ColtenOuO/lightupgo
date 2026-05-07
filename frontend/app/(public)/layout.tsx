import { Footer } from "@/components/public/footer";
import { Nav } from "@/components/public/nav";
import { apiGet } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

const FALLBACK_SETTINGS: SiteSettings = {
  site_name: "立光圍棋教室",
  tagline: "讓每一步都更有想法",
  hero_subtitle: null,
  phone: null,
  address: null,
  business_hours: null,
  register_form_url: null,
  register_form_note: null,
  meta_description: null,
  meta_keywords: [],
  facebook_url: null,
  instagram_url: null,
  line_id: null,
  youtube_url: null,
  updated_at: new Date().toISOString(),
};

async function getSettings(): Promise<SiteSettings> {
  try {
    return await apiGet<SiteSettings>("/api/v1/settings", { revalidate: 300 });
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <Nav settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
