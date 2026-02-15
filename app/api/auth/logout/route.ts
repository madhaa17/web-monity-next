import { NextResponse } from "next/server";
import { MONITY_TOKEN, MONITY_REFRESH_TOKEN } from "@/lib/auth/cookies";

function clearCookieOptions() {
  return {
    path: "/",
    maxAge: 0,
  };
}

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(MONITY_TOKEN, "", clearCookieOptions());
  res.cookies.set(MONITY_REFRESH_TOKEN, "", clearCookieOptions());
  return res;
}
