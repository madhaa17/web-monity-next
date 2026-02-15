import { queryOptions } from "@tanstack/react-query";
import * as incomesApi from "@/lib/api/incomes";

export const incomesQueryKey = ["incomes"] as const;

export function incomesQueryOptions() {
  return queryOptions({
    queryKey: incomesQueryKey,
    queryFn: () => incomesApi.listIncomes(),
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
