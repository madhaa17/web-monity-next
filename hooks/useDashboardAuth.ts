"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api/client";

/**
 * Handles dashboard auth: logout action. Route protection is done by middleware.
 */
export function useDashboardAuth() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await clearTokens();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return { mounted, isLoggingOut, handleLogout };
}
