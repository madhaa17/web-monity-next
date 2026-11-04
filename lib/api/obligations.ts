import { apiClient } from "@/lib/api/client";
import { buildQueryFromParams } from "@/lib/api/list-params";
import type { ApiResponse, Asset, ListResponse } from "@/lib/api/types";

/** A debt is money the user owes someone; a receivable is money someone owes the user. */
export type ObligationKind = "debt" | "receivable";

/** OVERDUE is derived by the server from the due date for unpaid items. */
export type ObligationStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

/** Decimal amounts arrive as strings; read them with toNumber. */
export interface Obligation {
  uuid: string;
  partyName: string;
  amount: string | number;
  paidAmount: string | number;
  dueDate?: string | null;
  status: ObligationStatus;
  note?: string | null;
  /** The CASH asset the money came into (debt) or went out of (receivable), if any. */
  asset?: Asset | null;
  createdAt: string;
  updatedAt: string;
}

export interface ObligationPayment {
  uuid: string;
  amount: string | number;
  date: string;
  note?: string | null;
  asset?: Asset | null;
  createdAt: string;
}

export interface ListObligationsParams {
  page?: number;
  limit?: number;
  status?: ObligationStatus;
}

export interface CreateObligationBody {
  partyName: string;
  amount: number;
  dueDate?: string;
  note?: string;
  assetUuid?: string;
}

/** Partial update: null clears dueDate, note or assetUuid; absent keys are left unchanged. */
export interface UpdateObligationBody {
  partyName?: string;
  amount?: number;
  dueDate?: string | null;
  note?: string | null;
  assetUuid?: string | null;
}

export interface CreatePaymentBody {
  amount: number;
  date: string;
  note?: string;
  assetUuid?: string;
}

const BASE: Record<ObligationKind, string> = { debt: "/debts", receivable: "/receivables" };

export async function listObligations(
  kind: ObligationKind,
  params: ListObligationsParams = {}
): Promise<ListResponse<Obligation>> {
  const query = buildQueryFromParams({ page: params.page, limit: params.limit, status: params.status });
  const res = await apiClient<ApiResponse<ListResponse<Obligation>>>(`${BASE[kind]}${query}`);
  return { items: res.data?.items ?? [], meta: res.data?.meta };
}

export async function createObligation(kind: ObligationKind, body: CreateObligationBody): Promise<Obligation> {
  const res = await apiClient<ApiResponse<Obligation>>(BASE[kind], {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateObligation(
  kind: ObligationKind,
  uuid: string,
  body: UpdateObligationBody
): Promise<Obligation> {
  const res = await apiClient<ApiResponse<Obligation>>(`${BASE[kind]}/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteObligation(kind: ObligationKind, uuid: string): Promise<void> {
  await apiClient<unknown>(`${BASE[kind]}/${uuid}`, { method: "DELETE" });
}

export async function listPayments(kind: ObligationKind, uuid: string): Promise<ObligationPayment[]> {
  const res = await apiClient<ApiResponse<ObligationPayment[]>>(`${BASE[kind]}/${uuid}/payments`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createPayment(
  kind: ObligationKind,
  uuid: string,
  body: CreatePaymentBody
): Promise<ObligationPayment> {
  const res = await apiClient<ApiResponse<ObligationPayment>>(`${BASE[kind]}/${uuid}/payments`, {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deletePayment(kind: ObligationKind, uuid: string, paymentUuid: string): Promise<void> {
  await apiClient<unknown>(`${BASE[kind]}/${uuid}/payments/${paymentUuid}`, { method: "DELETE" });
}
