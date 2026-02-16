"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Asset, Income, ListMeta } from "@/lib/api/types";
import type { CreateIncomeFormValues, UpdateIncomeFormValues } from "@/lib/validations/income";
import { createIncome, deleteIncome, updateIncome } from "@/lib/api/incomes";
import { incomesQueryKey, incomesQueryOptions } from "@/lib/queries/incomes";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { buildListSearchParams, getListParamsFromSearchParams } from "@/lib/url-list-params";
import { toast } from "sonner";

export interface UseIncomesDataResult {
  incomes: Income[];
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
  createMutation: ReturnType<typeof useMutation<Income, Error, CreateIncomeFormValues>>;
  updateMutation: ReturnType<typeof useMutation<Income, Error, { uuid: string; data: UpdateIncomeFormValues }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
}

export function useIncomesData(): UseIncomesDataResult {
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
  const { data, isLoading: incomesLoading, isError, error } = useQuery(incomesQueryOptions(listParams));
  const incomes = data?.items ?? [];
  const meta = data?.meta;

  const { data: assets = [], isLoading: assetsLoading } = useQuery(assetsQueryOptions());
  const cashAssets = assets.filter((a) => a.type === "CASH");
  const isLoading = incomesLoading || assetsLoading;

  const createMutation = useMutation({
    mutationFn: (body: CreateIncomeFormValues) => {
      const dateStr = body.date.includes("T") ? body.date : `${body.date}T00:00:00.000Z`;
      const payload: Parameters<typeof createIncome>[0] = {
        assetUuid: body.assetUuid,
        amount: body.amount,
        source: body.source?.trim() || "Other",
        date: dateStr,
      };
      if (body.note?.trim()) payload.note = body.note.trim();
      return createIncome(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Income added");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add income");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateIncomeFormValues }) =>
      updateIncome(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Income updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update income");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteIncome(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Income deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete income");
    },
  });

  return {
    incomes,
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
