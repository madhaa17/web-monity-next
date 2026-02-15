"use client";

import { useQuery } from "@tanstack/react-query";
import { authMeQueryOptions } from "@/lib/queries/auth";
import { useToken } from "@/hooks/useToken";
import type { User } from "@/lib/api/types";

export function useAuth(): {
  user: User | undefined;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { token, isLoaded } = useToken();
  const { data: user, isPending } = useQuery({
    ...authMeQueryOptions(),
    enabled: isLoaded && !!token,
  });

  const isLoading = !isLoaded || (!!token && isPending);

  return {
    user,
    token: token ?? null,
    isLoading,
    isAuthenticated: !!token && !!user,
  };
}
