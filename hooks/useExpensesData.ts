"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Asset, Expense, ListMeta } from "@/lib/api/types";
import type { CreateExpenseFormValues, UpdateExpenseFormValues } from "@/lib/validations/expense";
import { createExpense, deleteExpense, updateExpense } from "@/lib/api/expenses";
import { expensesQueryKey, expensesQueryOptions } from "@/lib/queries/expenses";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { buildListSearchParams, getListParamsFromSearchParams } from "@/lib/url-list-params";
import { toast } from "sonner";

export interface UseExpensesDataResult {
  expenses: Expense[];
  meta: ListMeta | undefined;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  month: string | undefined;
  setMonth: (month: string | undefined) => void;
  year: string | undefined;
  setYear: (year: string | undefined) => void;
  assets: Asset[];
  cashAssets: Asset[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createMutation: ReturnType<typeof useMutation<Expense, Error, CreateExpenseFormValues>>;
  updateMutation: ReturnType<typeof useMutation<Expense, Error, { uuid: string; data: UpdateExpenseFormValues }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
}

export function useExpensesData(): UseExpensesDataResult {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { page, limit, month, year } = getListParamsFromSearchParams(searchParams);

  const setPage = useCallback(
    (p: number) => {
      router.replace(`${pathname}?${buildListSearchParams({ page: p, limit, month, year })}`);
    },
    [pathname, router, limit, month, year]
  );

  const setLimit = useCallback(
    (l: number) => {
      router.replace(`${pathname}?${buildListSearchParams({ page: 1, limit: l, month, year })}`);
    },
    [pathname, router, month, year]
  );

  const setMonth = useCallback(
    (m: string | undefined) => {
      router.replace(`${pathname}?${buildListSearchParams({ page: 1, limit, month: m, year })}`);
    },
    [pathname, router, limit, year]
  );

  const setYear = useCallback(
    (y: string | undefined) => {
      router.replace(`${pathname}?${buildListSearchParams({ page: 1, limit, month, year: y })}`);
    },
    [pathname, router, limit, month]
  );

  const listParams = { page, limit, month, year };
  const { data, isLoading: expensesLoading, isError, error } = useQuery(expensesQueryOptions(listParams));
  const expenses = data?.items ?? [];
  const meta = data?.meta;

  const { data: assets = [], isLoading: assetsLoading } = useQuery(assetsQueryOptions());
  const cashAssets = assets.filter((a) => a.type === "CASH");
  const isLoading = expensesLoading || assetsLoading;

  const createMutation = useMutation({
    mutationFn: (body: CreateExpenseFormValues) =>
      createExpense({
        assetUuid: body.assetUuid,
        amount: body.amount,
        category: body.category,
        note: body.note,
        date: body.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Expense added");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateExpenseFormValues }) =>
      updateExpense(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Expense updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteExpense(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Expense deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete expense");
    },
  });

  return {
    expenses,
    meta,
    page,
    setPage,
    limit,
    setLimit,
    month,
    setMonth,
    year,
    setYear,
    assets,
    cashAssets,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
