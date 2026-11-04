import { queryOptions } from "@tanstack/react-query";
import * as api from "@/lib/api/obligations";
import type { ListObligationsParams, ObligationKind } from "@/lib/api/obligations";

/** ["debts"] / ["receivables"]: invalidating it refreshes lists and payment histories. */
export function obligationsQueryKey(kind: ObligationKind) {
  return [kind === "debt" ? "debts" : "receivables"] as const;
}

export function obligationsListQueryOptions(kind: ObligationKind, params: ListObligationsParams) {
  return queryOptions({
    queryKey: [...obligationsQueryKey(kind), "list", params] as const,
    queryFn: () => api.listObligations(kind, params),
  });
}

export function obligationPaymentsQueryOptions(kind: ObligationKind, uuid: string) {
  return queryOptions({
    queryKey: [...obligationsQueryKey(kind), uuid, "payments"] as const,
    queryFn: () => api.listPayments(kind, uuid),
  });
}
