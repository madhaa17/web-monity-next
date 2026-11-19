/**
 * Backend connection settings for server-side code only: proxy.ts (which proxies /api/v1 for the
 * browser) and serverFetch. Never import this from client components; INTERNAL_API_TOKEN must not
 * reach the browser bundle.
 */

/** Header carrying the secret shared with the backend; keep in sync with the backend's InternalTokenHeader. */
export const INTERNAL_TOKEN_HEADER = "X-Internal-Token";

/**
 * Backend base URL (no trailing slash). NEXT_PUBLIC_API_URL is still read as a fallback so existing
 * deployments keep working until API_URL is set.
 */
export function getApiUrl(): string {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  return url.replace(/\/$/, "");
}

/** Headers that prove a request comes from this frontend server. Empty when no token is configured (dev). */
export function internalHeaders(): Record<string, string> {
  const token = process.env.INTERNAL_API_TOKEN;
  return token ? { [INTERNAL_TOKEN_HEADER]: token } : {};
}
