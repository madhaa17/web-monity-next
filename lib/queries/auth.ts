import { queryOptions } from "@tanstack/react-query";
import * as auth from "@/lib/api/auth";

export const authMeQueryKey = ["auth", "me"] as const;

export function authMeQueryOptions() {
  return queryOptions({
    queryKey: authMeQueryKey,
    queryFn: () => auth.me(),
  });
}
