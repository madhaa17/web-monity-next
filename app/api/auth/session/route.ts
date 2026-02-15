import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/api/types";
import type { User } from "@/lib/api/types";
import { MONITY_TOKEN, MONITY_REFRESH_TOKEN } from "@/lib/auth/cookies";
import { serverFetch } from "@/lib/api/server-client";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function cookieOptions(maxAge: number, httpOnly: boolean) {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: IS_PRODUCTION,
    maxAge,
    ...(httpOnly ? { httpOnly: true } : {}),
  };
}

export async function POST(request: Request) {
  let body: { token?: string; refreshToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const token =
    typeof body.token === "string" ? body.token.trim() : "";
  const refreshToken =
    typeof body.refreshToken === "string" ? body.refreshToken.trim() : "";

  if (!token || !refreshToken) {
    return NextResponse.json(
      { success: false, message: "token and refreshToken required" },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(MONITY_TOKEN, token, {
    ...cookieOptions(ACCESS_TOKEN_MAX_AGE, false),
  });
  res.cookies.set(MONITY_REFRESH_TOKEN, refreshToken, {
    ...cookieOptions(REFRESH_TOKEN_MAX_AGE, true),
  });

  return res;
}

/** GET: return current session (user) if cookie token is valid. */
export async function GET() {
  try {
    const payload = await serverFetch<ApiResponse<User>>("/auth/me");
    const user = payload?.data;
    if (user) {
      return NextResponse.json({ authenticated: true, user });
    }
  } catch {
    // token missing or invalid
  }
  return NextResponse.json({ authenticated: false });
}
