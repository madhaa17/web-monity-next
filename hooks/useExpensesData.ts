"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Asset, Expense } from "@/lib/api/types";
import type { CreateExpenseFormValues, UpdateExpenseFormValues } from "@/lib/validations/expense";
import { createExpense, deleteExpense, updateExpense } from "@/lib/api/expenses";
import { expensesQueryKey, expensesQueryOptions } from "@/lib/queries/expenses";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { toast } from "sonner";

export interface UseExpensesDataResult {
  expenses: Expense[];
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
  const { data: expenses = [], isLoading: expensesLoading, isError, error } = useQuery(expensesQueryOptions());
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
