import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MoneyTor_TOKEN } from "@/lib/auth/cookies";

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

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(MoneyTor_TOKEN)?.value;
  const hasToken = !!token?.trim();
  const { pathname } = request.nextUrl;

  if (isProtected(pathname)) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const uuid = isAssetDetailPath(pathname);
    if (uuid) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const url = `${baseUrl.replace(/\/$/, "")}/api/v1/assets/${uuid}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
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
  matcher: ["/dashboard", "/dashboard/:path*", "/", "/login", "/register"],
};
