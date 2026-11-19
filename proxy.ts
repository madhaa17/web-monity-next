import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MoneyTor_TOKEN } from "@/lib/auth/cookies";
import { getApiUrl, internalHeaders, INTERNAL_TOKEN_HEADER } from "@/lib/api/server-config";

const API_PREFIX = "/api/v1";
const PROTECTED_PREFIX = "/dashboard";
const PUBLIC_PATHS = ["/", "/login", "/register"];
const ASSET_DETAIL_PATH = /^\/dashboard\/assets\/([^/]+)$/;
const ALLOWED_DETAIL_TYPES = ["CRYPTO", "STOCK"];

function isProtected(pathname: string): boolean {
  return pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p);
}

function isAssetDetailPath(pathname: string): string | null {
  const m = pathname.match(ASSET_DETAIL_PATH);
  return m?.[1] ?? null;
}

/**
 * Forwards /api/v1/* to the backend with the shared secret attached, so the backend only answers
 * this server. The browser keeps talking same-origin; the backend's Set-Cookie headers come back
 * through this rewrite and land on this domain.
 */
function proxyApi(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const headers = new Headers(request.headers);
  // Never trust a token sent by the browser; only this server may set it.
  headers.delete(INTERNAL_TOKEN_HEADER);
  for (const [name, value] of Object.entries(internalHeaders())) {
    headers.set(name, value);
  }
  return NextResponse.rewrite(new URL(`${getApiUrl()}${pathname}${search}`), {
    request: { headers },
  });
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith(`${API_PREFIX}/`)) {
    return proxyApi(request);
  }

  const token = request.cookies.get(MoneyTor_TOKEN)?.value;
  const hasToken = !!token?.trim();
  const { pathname } = request.nextUrl;

  if (isProtected(pathname)) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const uuid = isAssetDetailPath(pathname);
    if (uuid) {
      const url = `${getApiUrl()}${API_PREFIX}/assets/${encodeURIComponent(uuid)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, ...internalHeaders() },
      });
      if (!res.ok) {
        return NextResponse.redirect(new URL("/404", request.url));
      }
      const body = (await res.json()) as { data?: { type?: string } };
      const type = body.data?.type;
      if (!type || !ALLOWED_DETAIL_TYPES.includes(type)) {
        return NextResponse.redirect(new URL("/404", request.url));
      }
    }
    return NextResponse.next();
  }

  if (isPublic(pathname) && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/:path*", "/dashboard", "/dashboard/:path*", "/", "/login", "/register"],
};
