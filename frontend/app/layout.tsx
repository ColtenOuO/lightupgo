import type { Metadata } from "next";
import { Klee_One, Noto_Sans_TC } from "next/font/google";

import { apiGet } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const kleeOne = Klee_One({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-klee-one",
  display: "swap",
});

async function getSettings(): Promise<SiteSettings | null> {
  try {
    return await apiGet<SiteSettings>("/api/v1/settings", { revalidate: 300 });
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s?.site_name ?? "立光圍棋教室";
  const description =
    s?.meta_description ??
    "立光圍棋教室，陪伴孩子在棋盤上培養專注、邏輯與勇氣。";
  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    keywords: s?.meta_keywords ?? [
      "圍棋教室",
      "兒童圍棋",
      "台南圍棋",
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className={`${notoSansTC.variable} ${kleeOne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
