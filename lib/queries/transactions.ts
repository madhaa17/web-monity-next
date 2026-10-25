import { queryOptions } from "@tanstack/react-query";
import * as transactionsApi from "@/lib/api/transactions";
import * as categoriesApi from "@/lib/api/categories";
import type { CategoryType, TransactionKind } from "@/lib/api/types";
import type { TransactionFilterParams, TransactionListParams } from "@/lib/api/list-params";

/** Root key per kind ("incomes" / "expenses"); invalidating it refreshes lists and summaries. */
export function transactionsQueryKey(kind: TransactionKind) {
  return [kind === "income" ? "incomes" : "expenses"] as const;
}

export function transactionsListQueryOptions(kind: TransactionKind, params: TransactionListParams) {
  return queryOptions({
    queryKey: [...transactionsQueryKey(kind), "list", params] as const,
    queryFn: () => transactionsApi.listTransactions(kind, params),
  });
}

export function transactionSummaryQueryOptions(kind: TransactionKind, params: TransactionFilterParams) {
  return queryOptions({
    queryKey: [...transactionsQueryKey(kind), "summary", params] as const,
    queryFn: () => transactionsApi.getTransactionSummary(kind, params),
  });
}

export const categoriesQueryKey = ["categories"] as const;

export function categoriesQueryOptions(type: CategoryType) {
  return queryOptions({
    queryKey: [...categoriesQueryKey, type] as const,
    queryFn: () => categoriesApi.listCategories(type),
  });
}

export function categoryTypeOf(kind: TransactionKind): CategoryType {
  return kind === "income" ? "INCOME" : "EXPENSE";
}
