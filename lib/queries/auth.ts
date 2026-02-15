import { queryOptions } from "@tanstack/react-query";
import * as auth from "@/lib/api/auth";
import type { User } from "@/lib/api/types";

export const authMeQueryKey = ["auth", "me"] as const;

export function authMeQueryOptions() {
  return queryOptions({
    queryKey: authMeQueryKey,
    queryFn: () => auth.me(),
  });
}

export const authSessionQueryKey = ["auth", "session"] as const;

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

export function authSessionQueryOptions() {
  return queryOptions({
    queryKey: authSessionQueryKey,
    queryFn: async (): Promise<SessionResponse> => {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = await res.json();
      return data as SessionResponse;
    },
  });
}
