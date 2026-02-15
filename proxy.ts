import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MONITY_TOKEN } from "@/lib/auth/cookies";

const PROTECTED_PREFIX = "/dashboard";
const PUBLIC_PATHS = ["/", "/login", "/register"];

function isProtected(pathname: string): boolean {
  return pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p);
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(MONITY_TOKEN)?.value;
  const hasToken = !!token?.trim();
  const { pathname } = request.nextUrl;

  if (isProtected(pathname)) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
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
