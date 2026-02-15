"use client";

import { useQuery } from "@tanstack/react-query";
import { authSessionQueryOptions } from "@/lib/queries/auth";
import { useToken } from "@/hooks/useToken";
import type { User } from "@/lib/api/types";

export function useAuth(): {
  user: User | undefined;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { token, isLoaded } = useToken();
  const { data: session, isPending } = useQuery({
    ...authSessionQueryOptions(),
    enabled: isLoaded,
  });

  const isLoading = !isLoaded || isPending;

  return {
    user: session?.user,
    token: token ?? null,
    isLoading,
    isAuthenticated: !!session?.authenticated && !!session?.user,
  };
}
