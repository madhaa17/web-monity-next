import { queryOptions } from "@tanstack/react-query";
import * as expensesApi from "@/lib/api/expenses";

export const expensesQueryKey = ["expenses"] as const;

export function expensesQueryOptions() {
  return queryOptions({
    queryKey: expensesQueryKey,
    queryFn: () => expensesApi.listExpenses(),
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
