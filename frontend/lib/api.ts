/**
 * FastAPI client。
 *
 * - Server Component / SSR 用 INTERNAL_API_URL 走容器內網路（http://backend:8000）
 * - 瀏覽器與圖片 URL：預設「相對路徑」，由 Next.js rewrites 代理到 backend。
 *   這讓網站不論用 localhost / LAN IP / 正式網域開都行，
 *   除非有 NEXT_PUBLIC_API_URL 明確指定外部網址。
 */

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    // SSR：走容器內網路
    return process.env.INTERNAL_API_URL || PUBLIC_API_URL || "http://backend:8000";
  }
  // 瀏覽器端：預設用相對路徑（透過 Next rewrites）
  return PUBLIC_API_URL;
}

type FetchOpts = RequestInit & {
  /** Next.js ISR 秒數，0 = no-cache、不傳 = 60 秒 */
  revalidate?: number;
  token?: string;
};

export async function apiGet<T>(path: string, opts?: FetchOpts): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts?.headers as Record<string, string> | undefined),
  };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    next: { revalidate: opts?.revalidate ?? 60 },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function apiSend<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  opts?: { token?: string },
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * 把 API 回傳的圖片相對網址（/uploads/...）展開成瀏覽器能載入的網址。
 *
 * 預設行為：保持相對路徑，由 Next.js rewrites 反向代理到 backend。
 * 若有 NEXT_PUBLIC_API_URL（外部網域）則前綴上去。
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/")) return `${PUBLIC_API_URL}${url}`;
  return url;
}
