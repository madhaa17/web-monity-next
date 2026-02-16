import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MoneyTor_TOKEN, MoneyTor_REFRESH_TOKEN } from "@/lib/auth/cookies";
import { getBaseUrl } from "@/lib/api/client";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

function cookieOptions(maxAge: number, httpOnly: boolean) {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: IS_PRODUCTION,
    maxAge,
    ...(httpOnly ? { httpOnly: true } : {}),
  };
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(MoneyTor_REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: "No refresh token" },
      { status: 401 }
    );
  }

  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/v1/auth/refresh`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: "Refresh failed" },
      { status: 401 }
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid response" },
      { status: 502 }
    );
  }

  const payload = data && typeof data === "object" && "data" in data
    ? (data as { data: Record<string, unknown> }).data
    : (data as Record<string, unknown>);
  const token =
    (typeof payload?.token === "string" ? payload.token : null) ??
    (typeof payload?.Token === "string" ? payload.Token : null);
  const newRefreshToken =
    (typeof payload?.refreshToken === "string" ? payload.refreshToken : null) ??
    (typeof payload?.RefreshToken === "string" ? payload.RefreshToken : null);

  if (!token || !newRefreshToken) {
    return NextResponse.json(
      { success: false, message: "Invalid refresh response" },
      { status: 502 }
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(MoneyTor_TOKEN, token, {
    ...cookieOptions(ACCESS_TOKEN_MAX_AGE, false),
  });
  res.cookies.set(MoneyTor_REFRESH_TOKEN, newRefreshToken, {
    ...cookieOptions(REFRESH_TOKEN_MAX_AGE, true),
  });

  return res;
}
