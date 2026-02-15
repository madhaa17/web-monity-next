"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRefreshToken, clearTokens } from "@/lib/api/client";
import { logout as logoutApi } from "@/lib/api/auth";

/**
 * Handles dashboard auth: redirect to login when no token, and logout action.
 * Use in dashboard layout only.
 */
export function useDashboardAuth() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
    }
  }, [mounted, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutApi(getRefreshToken() ?? undefined);
    } catch {
      // Still clear local state and redirect if API fails (e.g. offline)
    } finally {
      clearTokens();
      router.replace("/login");
    }
  }

  return { mounted, isLoggingOut, handleLogout };
}
