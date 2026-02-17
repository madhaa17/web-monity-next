"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Debt, DebtPayment, ListMeta } from "@/lib/api/types";
import type {
  CreateDebtFormValues,
  UpdateDebtFormValues,
  CreateDebtPaymentFormValues,
} from "@/lib/validations/debt";
import {
  createDebt,
  createDebtPayment,
  deleteDebt,
  updateDebt,
} from "@/lib/api/debts";
import { debtPaymentsQueryKey, debtsQueryKey, debtsQueryOptions } from "@/lib/queries/debts";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { buildListSearchParams, getListParamsFromSearchParams } from "@/lib/url-list-params";
import { toast } from "sonner";

export interface UseDebtsDataResult {
  debts: Debt[];
  meta: ListMeta | undefined;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createMutation: ReturnType<typeof useMutation<Debt, Error, CreateDebtFormValues>>;
  updateMutation: ReturnType<typeof useMutation<Debt, Error, { uuid: string; data: UpdateDebtFormValues }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  addPaymentMutation: ReturnType<
    typeof useMutation<DebtPayment, Error, { uuid: string; data: CreateDebtPaymentFormValues }>
  >;
}

function toCreateBody(body: CreateDebtFormValues) {
  const payload: Parameters<typeof createDebt>[0] = {
    partyName: body.partyName.trim(),
    amount: Number(body.amount),
  };
  if (body.dueDate?.trim()) {
    const d = body.dueDate.trim();
    payload.dueDate = d.includes("T") ? d : `${d}T00:00:00.000Z`;
  }
  if (body.note?.trim()) payload.note = body.note.trim();
  if (body.assetUuid?.trim()) payload.assetUuid = body.assetUuid.trim();
  return payload;
}

export function useDebtsData(): UseDebtsDataResult {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { page, limit } = getListParamsFromSearchParams(searchParams);
  const listParams = { page, limit };
  const { data, isLoading, isError, error } = useQuery(debtsQueryOptions(listParams));
  const debts = data?.items ?? [];
  const meta = data?.meta;

  const setPage = useCallback(
    (p: number) => {
      router.replace(
        `${pathname}?${buildListSearchParams({ page: p, limit, month: undefined, year: undefined })}`
      );
    },
    [pathname, router, limit]
  );

  const setLimit = useCallback(
    (l: number) => {
      router.replace(
        `${pathname}?${buildListSearchParams({ page: 1, limit: l, month: undefined, year: undefined })}`
      );
    },
    [pathname, router]
  );

  const createMutation = useMutation({
    mutationFn: (body: CreateDebtFormValues) => createDebt(toCreateBody(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Debt added");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add debt");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateDebtFormValues }) => {
      const body: Parameters<typeof updateDebt>[1] = {};
      if (data.partyName !== undefined) body.partyName = data.partyName.trim();
      if (data.amount !== undefined && Number.isFinite(Number(data.amount)))
        body.amount = Number(data.amount);
      if (data.dueDate !== undefined) {
        const d = data.dueDate?.trim();
        body.dueDate = d ? (d.includes("T") ? d : `${d}T00:00:00.000Z`) : null;
      }
      if (data.note !== undefined) body.note = data.note?.trim() ?? null;
      if (data.assetUuid !== undefined) body.assetUuid = data.assetUuid?.trim() ?? null;
      return updateDebt(uuid, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Debt updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update debt");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteDebt(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Debt deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete debt");
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: CreateDebtPaymentFormValues }) => {
      const body: Parameters<typeof createDebtPayment>[1] = {
        amount: Number(data.amount),
        date: data.date.includes("T") ? data.date : `${data.date}T00:00:00.000Z`,
      };
      if (data.note?.trim()) body.note = data.note.trim();
      if (data.assetUuid?.trim()) body.assetUuid = data.assetUuid.trim();
      return createDebtPayment(uuid, body);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: debtPaymentsQueryKey(uuid) });
      queryClient.invalidateQueries({ queryKey: debtsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Payment recorded");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    },
  });

  return {
    debts,
    meta,
    page,
    setPage,
    limit,
    setLimit,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    createMutation,
    updateMutation,
    deleteMutation,
    addPaymentMutation,
  };
}
