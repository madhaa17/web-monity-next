import { NextResponse } from "next/server";
import { MoneyTor_TOKEN, MoneyTor_REFRESH_TOKEN } from "@/lib/auth/cookies";

function clearCookieOptions() {
  return {
    path: "/",
    maxAge: 0,
  };
}

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(MoneyTor_TOKEN, "", clearCookieOptions());
  res.cookies.set(MoneyTor_REFRESH_TOKEN, "", clearCookieOptions());
  return res;
}
