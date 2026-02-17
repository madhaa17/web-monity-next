import { queryOptions } from "@tanstack/react-query";
import * as debtsApi from "@/lib/api/debts";
import type { ListDebtsParams } from "@/lib/api/debts";

export const debtsQueryKey = ["debts"] as const;

export function debtsQueryKeyWithParams(params?: ListDebtsParams) {
  return [...debtsQueryKey, params ?? {}] as const;
}

export function debtsQueryOptions(params?: ListDebtsParams) {
  return queryOptions({
    queryKey: debtsQueryKeyWithParams(params),
    queryFn: () => debtsApi.listDebts(params),
  });
}

export function debtQueryKey(uuid: string) {
  return ["debts", uuid] as const;
}

export function debtQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: debtQueryKey(uuid),
    queryFn: () => debtsApi.getDebt(uuid),
  });
}

export function debtPaymentsQueryKey(uuid: string) {
  return ["debts", uuid, "payments"] as const;
}

export function debtPaymentsQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: debtPaymentsQueryKey(uuid),
    queryFn: () => debtsApi.listDebtPayments(uuid),
  });
}
