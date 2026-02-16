import { queryOptions } from "@tanstack/react-query";
import * as expensesApi from "@/lib/api/expenses";
import type { ListDateFilterParams } from "@/lib/api/list-params";

export const expensesQueryKey = ["expenses"] as const;

export function expensesQueryKeyWithParams(params?: ListDateFilterParams) {
  return [...expensesQueryKey, params ?? {}] as const;
}

export function expensesQueryOptions(params?: ListDateFilterParams) {
  return queryOptions({
    queryKey: expensesQueryKeyWithParams(params),
    queryFn: () => expensesApi.listExpenses(params),
  });
}

export function expenseQueryKey(uuid: string) {
  return ["expenses", uuid] as const;
}

export function expenseQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: expenseQueryKey(uuid),
    queryFn: () => expensesApi.getExpense(uuid),
  });
}
