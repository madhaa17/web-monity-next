"use client";

import { useQuery } from "@tanstack/react-query";
import { authMeQueryOptions } from "@/lib/queries/auth";
import type { User } from "@/lib/api/types";

/** Current user from GET /auth/me; the session itself lives in HttpOnly cookies. */
export function useAuth(): {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { data: user, isPending } = useQuery(authMeQueryOptions());

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!user,
  };
}
