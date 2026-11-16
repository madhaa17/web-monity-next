import { NextResponse } from "next/server";

/**
 * CSRF guard for the cookie-setting/reading route handlers under /api/auth.
 * Our own client calls them with same-origin fetch, so anything else is rejected.
 * Uses Sec-Fetch-Site (all modern browsers) and falls back to comparing Origin with Host.
 */
export function rejectCrossSite(request: Request): NextResponse | null {
  const site = request.headers.get("sec-fetch-site");
  if (site) {
    return site === "same-origin" ? null : forbidden();
  }

  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    try {
      if (new URL(origin).host !== host) return forbidden();
    } catch {
      return forbidden();
    }
  }
  // No Sec-Fetch-Site and no Origin: not a browser cross-site request (e.g. curl), which can't ride a victim's cookies.
  return null;
}

/** Rejects bodies that a cross-site HTML form could produce (text/plain, form-urlencoded, multipart). */
export function requireJson(request: Request): NextResponse | null {
  const type = request.headers.get("content-type") ?? "";
  return type.toLowerCase().startsWith("application/json")
    ? null
    : NextResponse.json({ success: false, message: "Content-Type must be application/json" }, { status: 415 });
}

function forbidden() {
  return NextResponse.json({ success: false, message: "Cross-site request rejected" }, { status: 403 });
}
