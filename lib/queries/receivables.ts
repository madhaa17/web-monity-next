import { queryOptions } from "@tanstack/react-query";
import * as receivablesApi from "@/lib/api/receivables";
import type { ListReceivablesParams } from "@/lib/api/receivables";

export const receivablesQueryKey = ["receivables"] as const;

export function receivablesQueryKeyWithParams(params?: ListReceivablesParams) {
  return [...receivablesQueryKey, params ?? {}] as const;
}

export function receivablesQueryOptions(params?: ListReceivablesParams) {
  return queryOptions({
    queryKey: receivablesQueryKeyWithParams(params),
    queryFn: () => receivablesApi.listReceivables(params),
  });
}

export function receivableQueryKey(uuid: string) {
  return ["receivables", uuid] as const;
}

export function receivableQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: receivableQueryKey(uuid),
    queryFn: () => receivablesApi.getReceivable(uuid),
  });
}

export function receivablePaymentsQueryKey(uuid: string) {
  return ["receivables", uuid, "payments"] as const;
}

export function receivablePaymentsQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: receivablePaymentsQueryKey(uuid),
    queryFn: () => receivablesApi.listReceivablePayments(uuid),
  });
}
