import { cookies } from "next/headers";
import { MoneyTor_TOKEN } from "@/lib/auth/cookies";
import { getBaseUrl } from "@/lib/api/client";

/**
 * Read access token from cookies. Use only in Server Components, Route Handlers, or server-side code.
 */
export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(MoneyTor_TOKEN)?.value;
  if (value == null || value === "" || value === "undefined") return null;
  return value;
}

/**
 * Fetch from MoneyTor backend with Authorization: Bearer from cookie. Use only on the server.
 */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = await getServerToken();
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const url = path.startsWith("/") ? `${baseUrl}/api/v1${path}` : `${baseUrl}/api/v1/${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    let message: string;
    try {
      const data = JSON.parse(text) as { message?: string; error?: string };
      message = data.message ?? data.error ?? text;
    } catch {
      message = text || res.statusText;
    }
    throw new Error(message || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>;
}
