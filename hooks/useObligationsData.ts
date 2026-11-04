"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createObligation,
  createPayment,
  deleteObligation,
  deletePayment,
  updateObligation,
  type CreateObligationBody,
  type CreatePaymentBody,
  type ObligationKind,
  type ObligationStatus,
  type UpdateObligationBody,
} from "@/lib/api/obligations";
import { obligationsListQueryOptions, obligationsQueryKey } from "@/lib/queries/obligations";
import { assetsQueryKey, assetsQueryOptions } from "@/lib/queries/assets";
import { overviewQueryOptions } from "@/lib/queries/insights";
import { invalidateOverviewQueries } from "@/lib/queries/overview";

const PAGE_SIZE = 20;
const NOUN: Record<ObligationKind, string> = { debt: "Debt", receivable: "Receivable" };

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** List, totals, cash assets and mutations for the debts or receivables page. */
export function useObligationsData(kind: ObligationKind) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatusState] = useState<ObligationStatus | undefined>(undefined);

  const list = useQuery(obligationsListQueryOptions(kind, { page, limit: PAGE_SIZE, status }));
  const overview = useQuery(overviewQueryOptions());
  const assets = useQuery(assetsQueryOptions());

  // Debts and receivables move money in and out of CASH assets, so balances change too.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: obligationsQueryKey(kind) });
    queryClient.invalidateQueries({ queryKey: assetsQueryKey });
    invalidateOverviewQueries(queryClient);
  };
  const noun = NOUN[kind];

  const createMutation = useMutation({
    mutationFn: (body: CreateObligationBody) => createObligation(kind, body),
    onSuccess: () => {
      invalidate();
      toast.success(`${noun} added`);
    },
    onError: (err) => toast.error(errorMessage(err, `Failed to add ${noun.toLowerCase()}`)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, body }: { uuid: string; body: UpdateObligationBody }) => updateObligation(kind, uuid, body),
    onSuccess: () => {
      invalidate();
      toast.success(`${noun} updated`);
    },
    onError: (err) => toast.error(errorMessage(err, `Failed to update ${noun.toLowerCase()}`)),
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteObligation(kind, uuid),
    onSuccess: () => {
      invalidate();
      toast.success(`${noun} deleted`);
    },
    onError: (err) => toast.error(errorMessage(err, `Failed to delete ${noun.toLowerCase()}`)),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ uuid, body }: { uuid: string; body: CreatePaymentBody }) => createPayment(kind, uuid, body),
    onSuccess: () => {
      invalidate();
      toast.success("Payment recorded");
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to record payment")),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: ({ uuid, paymentUuid }: { uuid: string; paymentUuid: string }) =>
      deletePayment(kind, uuid, paymentUuid),
    onSuccess: () => {
      invalidate();
      toast.success("Payment removed");
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to remove payment")),
  });

  const setStatus = (next: ObligationStatus | undefined) => {
    setStatusState(next);
    setPage(1);
  };

  return {
    items: list.data?.items ?? [],
    meta: list.data?.meta,
    isLoading: list.isLoading,
    error: list.error,
    page,
    setPage,
    status,
    setStatus,
    outstanding: kind === "debt" ? overview.data?.totalDebt : overview.data?.totalReceivable,
    overdueCount: kind === "debt" ? overview.data?.debtOverdueCount : overview.data?.receivableOverdueCount,
    isSummaryLoading: overview.isLoading,
    cashAssets: (assets.data ?? []).filter((a) => a.type === "CASH"),
    createMutation,
    updateMutation,
    deleteMutation,
    paymentMutation,
    deletePaymentMutation,
  };
}
