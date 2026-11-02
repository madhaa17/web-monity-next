import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MoneyTor_TOKEN, MoneyTor_REFRESH_TOKEN } from "@/lib/auth/cookies";
import { getBaseUrl } from "@/lib/api/client";

function clearCookieOptions() {
  return {
    path: "/",
    maxAge: 0,
  };
}

/** Revokes both tokens on the backend so they cannot be reused, then clears the auth cookies. */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MoneyTor_TOKEN)?.value;
  const refreshToken = cookieStore.get(MoneyTor_REFRESH_TOKEN)?.value;

  if (token || refreshToken) {
    const baseUrl = getBaseUrl().replace(/\/$/, "");
    try {
      await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refreshToken ?? "" }),
      });
    } catch {
      // Backend unreachable: still clear the cookies so the user is signed out locally.
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(MoneyTor_TOKEN, "", clearCookieOptions());
  res.cookies.set(MoneyTor_REFRESH_TOKEN, "", clearCookieOptions());
  return res;
}
