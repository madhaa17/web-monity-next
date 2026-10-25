"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Category, CategoryType, TransactionBody, TransactionKind } from "@/lib/api/types";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type Transaction,
} from "@/lib/api/transactions";
import { createCategory, deleteCategory, updateCategory } from "@/lib/api/categories";
import {
  categoriesQueryKey,
  categoriesQueryOptions,
  categoryTypeOf,
  transactionsListQueryOptions,
  transactionsQueryKey,
  transactionSummaryQueryOptions,
} from "@/lib/queries/transactions";
import { assetsQueryKey, assetsQueryOptions } from "@/lib/queries/assets";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";

const LABELS: Record<TransactionKind, string> = { income: "Income", expense: "Expense" };

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** Everything that shows a balance, total or category name may change after a write. */
function invalidateAfterWrite(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: transactionsQueryKey("income") });
  queryClient.invalidateQueries({ queryKey: transactionsQueryKey("expense") });
  queryClient.invalidateQueries({ queryKey: assetsQueryKey });
  invalidateOverviewQueries(queryClient);
}

/** List, summary, categories, assets and mutations for the incomes or expenses page. */
export function useTransactionsData<K extends TransactionKind>(kind: K) {
  const queryClient = useQueryClient();
  const filterState = useTransactionFilters();
  const label = LABELS[kind];

  const list = useQuery(transactionsListQueryOptions(kind, filterState.listParams));
  const summary = useQuery(transactionSummaryQueryOptions(kind, filterState.summaryParams));
  const categories = useQuery(categoriesQueryOptions(categoryTypeOf(kind)));
  const assets = useQuery(assetsQueryOptions());
  const allAssets = assets.data ?? [];

  const createMutation = useMutation({
    mutationFn: (body: TransactionBody) => createTransaction(kind, body),
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
      toast.success(`${label} added`);
    },
    onError: (err) => toast.error(errorMessage(err, `Failed to add ${kind}`)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, body }: { uuid: string; body: Partial<TransactionBody> }) =>
      updateTransaction(kind, uuid, body),
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
      toast.success(`${label} updated`);
    },
    onError: (err) => toast.error(errorMessage(err, `Failed to update ${kind}`)),
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteTransaction(kind, uuid),
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
      toast.success(`${label} deleted`);
    },
    onError: (err) => toast.error(errorMessage(err, `Failed to delete ${kind}`)),
  });

  return {
    ...filterState,
    items: (list.data?.items ?? []) as Transaction<K>[],
    meta: list.data?.meta,
    summary: summary.data,
    isSummaryLoading: summary.isLoading,
    categories: categories.data ?? [],
    assets: allAssets,
    cashAssets: allAssets.filter((a) => a.type === "CASH"),
    isLoading: list.isLoading || assets.isLoading || categories.isLoading,
    error: list.error instanceof Error ? list.error : null,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

/** Create, rename/recolor and delete categories of one type. */
export function useCategoryMutations(type: CategoryType) {
  const queryClient = useQueryClient();

  const onChanged = () => {
    queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    // Category names and colors are shown in lists, summaries and charts.
    invalidateAfterWrite(queryClient);
  };

  const createMutation = useMutation({
    mutationFn: (body: { name: string; color?: string }) => createCategory({ type, ...body }),
    onSuccess: (category: Category) => {
      onChanged();
      toast.success(`Category "${category.name}" added`);
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to add category")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, body }: { uuid: string; body: { name?: string; color?: string } }) =>
      updateCategory(uuid, body),
    onSuccess: () => {
      onChanged();
      toast.success("Category updated");
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to update category")),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ uuid, reassignTo }: { uuid: string; reassignTo?: string }) =>
      deleteCategory(uuid, reassignTo),
    onSuccess: () => {
      onChanged();
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to delete category")),
  });

  return { createMutation, updateMutation, deleteMutation };
}
