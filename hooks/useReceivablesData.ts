"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { ListMeta, Receivable, ReceivablePayment } from "@/lib/api/types";
import type {
  CreateReceivableFormValues,
  UpdateReceivableFormValues,
  CreateReceivablePaymentFormValues,
} from "@/lib/validations/receivable";
import {
  createReceivable,
  createReceivablePayment,
  deleteReceivable,
  updateReceivable,
} from "@/lib/api/receivables";
import {
  receivablePaymentsQueryKey,
  receivablesQueryKey,
  receivablesQueryOptions,
} from "@/lib/queries/receivables";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { buildListSearchParams, getListParamsFromSearchParams } from "@/lib/url-list-params";
import { toast } from "sonner";

export interface UseReceivablesDataResult {
  receivables: Receivable[];
  meta: ListMeta | undefined;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createMutation: ReturnType<typeof useMutation<Receivable, Error, CreateReceivableFormValues>>;
  updateMutation: ReturnType<typeof useMutation<Receivable, Error, { uuid: string; data: UpdateReceivableFormValues }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  addPaymentMutation: ReturnType<
    typeof useMutation<
      ReceivablePayment,
      Error,
      { uuid: string; data: CreateReceivablePaymentFormValues }
    >
  >;
}

function toCreateBody(body: CreateReceivableFormValues) {
  const payload: Parameters<typeof createReceivable>[0] = {
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

export function useReceivablesData(): UseReceivablesDataResult {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { page, limit } = getListParamsFromSearchParams(searchParams);
  const listParams = { page, limit };
  const { data, isLoading, isError, error } = useQuery(receivablesQueryOptions(listParams));
  const receivables = data?.items ?? [];
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
    mutationFn: (body: CreateReceivableFormValues) => createReceivable(toCreateBody(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivablesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Receivable added");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add receivable");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateReceivableFormValues }) => {
      const body: Parameters<typeof updateReceivable>[1] = {};
      if (data.partyName !== undefined) body.partyName = data.partyName.trim();
      if (data.amount !== undefined && Number.isFinite(Number(data.amount)))
        body.amount = Number(data.amount);
      if (data.dueDate !== undefined) {
        const d = data.dueDate?.trim();
        body.dueDate = d ? (d.includes("T") ? d : `${d}T00:00:00.000Z`) : null;
      }
      if (data.note !== undefined) body.note = data.note?.trim() ?? null;
      if (data.assetUuid !== undefined) body.assetUuid = data.assetUuid?.trim() ?? null;
      return updateReceivable(uuid, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivablesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Receivable updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update receivable");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteReceivable(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivablesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Receivable deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete receivable");
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: CreateReceivablePaymentFormValues;
    }) => {
      const body: Parameters<typeof createReceivablePayment>[1] = {
        amount: Number(data.amount),
        date: data.date.includes("T") ? data.date : `${data.date}T00:00:00.000Z`,
      };
      if (data.note?.trim()) body.note = data.note.trim();
      if (data.assetUuid?.trim()) body.assetUuid = data.assetUuid.trim();
      return createReceivablePayment(uuid, body);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: receivablePaymentsQueryKey(uuid) });
      queryClient.invalidateQueries({ queryKey: receivablesQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Payment recorded");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    },
  });

  return {
    receivables,
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
