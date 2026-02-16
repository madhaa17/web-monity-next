import { queryOptions } from "@tanstack/react-query";
import * as incomesApi from "@/lib/api/incomes";
import type { ListDateFilterParams } from "@/lib/api/list-params";

export const incomesQueryKey = ["incomes"] as const;

export function incomesQueryKeyWithParams(params?: ListDateFilterParams) {
  return [...incomesQueryKey, params ?? {}] as const;
}

export function incomesQueryOptions(params?: ListDateFilterParams) {
  return queryOptions({
    queryKey: incomesQueryKeyWithParams(params),
    queryFn: () => incomesApi.listIncomes(params),
  });
}

export function incomeQueryKey(uuid: string) {
  return ["incomes", uuid] as const;
}

export function incomeQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: incomeQueryKey(uuid),
    queryFn: () => incomesApi.getIncome(uuid),
  });
}
