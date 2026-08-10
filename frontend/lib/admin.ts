/**
 * 後台用的 API client + 認證輔助。
 *
 * 設計重點：
 * - Token 存在 localStorage（內部管理介面，單一管理者，可接受）。
 * - 401 → 自動清掉 token 並回登入頁。
 * - 401 以外的錯誤丟出 Error，給呼叫端處理。
 */

const TOKEN_KEY = "lightupgo_admin_token";

// 預設相對路徑，由 Next.js rewrites 代理到 backend；
// 若用 NEXT_PUBLIC_API_URL 明確指定外部網址也支援。
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string) {
  window.localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

function url(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

async function handleAuthError(res: Response) {
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("登入逾時，請重新登入");
  }
}

export async function adminGet<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(url(path), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  await handleAuthError(res);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export async function adminSend<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const res = await fetch(url(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  await handleAuthError(res);
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const txt = await res.text();
      detail += ` ${txt}`;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function adminLogin(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);
  const res = await fetch(url("/api/v1/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("帳號或密碼錯誤");
  const data = (await res.json()) as { access_token: string };
  setToken(data.access_token);
  return data;
}

export async function uploadImage(file: File): Promise<{ url: string; size: number; filename: string }> {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(url("/api/v1/upload/image"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  await handleAuthError(res);
  if (!res.ok) throw new Error(`上傳失敗：${await res.text()}`);
  return res.json();
}

export function imageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return path;
}
