import { apiClient } from "@/lib/api/client";
import { buildQueryFromParams } from "@/lib/api/list-params";
import type {
  ApiResponse,
  Debt,
  DebtPayment,
  CreateDebtRequest,
  UpdateDebtRequest,
  CreateDebtPaymentRequest,
  ListResponse,
} from "@/lib/api/types";

export interface ListDebtsParams {
  page?: number;
  limit?: number;
  status?: string;
  due_from?: string;
  due_to?: string;
}

function normalizeListResponse<T>(data: unknown): ListResponse<T> {
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as ListResponse<T>).items)
  ) {
    const r = data as ListResponse<T>;
    return { items: r.items, meta: r.meta };
  }
  if (Array.isArray(data)) return { items: data as T[] };
  return { items: [] };
}

function toQueryParams(params?: ListDebtsParams): Record<string, string | number | undefined | null> {
  if (!params) return {};
  return {
    page: params.page,
    limit: params.limit,
    status: params.status,
    due_from: params.due_from,
    due_to: params.due_to,
  };
}

export async function listDebts(params?: ListDebtsParams): Promise<ListResponse<Debt>> {
  const path = `/debts${buildQueryFromParams(toQueryParams(params))}`;
  const res = await apiClient<ApiResponse<ListResponse<Debt>>>(path);
  return normalizeListResponse<Debt>(res.data);
}

export async function getDebt(uuid: string): Promise<Debt> {
  const res = await apiClient<ApiResponse<Debt>>(`/debts/${uuid}`);
  return res.data;
}

export async function createDebt(body: CreateDebtRequest): Promise<Debt> {
  const res = await apiClient<ApiResponse<Debt>>("/debts", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateDebt(uuid: string, body: UpdateDebtRequest): Promise<Debt> {
  const res = await apiClient<ApiResponse<Debt>>(`/debts/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteDebt(uuid: string): Promise<void> {
  await apiClient<unknown>(`/debts/${uuid}`, { method: "DELETE" });
}

export async function listDebtPayments(uuid: string): Promise<DebtPayment[]> {
  const res = await apiClient<ApiResponse<DebtPayment[]>>(`/debts/${uuid}/payments`);
  const data = res.data;
  return Array.isArray(data) ? data : [];
}

export async function createDebtPayment(
  uuid: string,
  body: CreateDebtPaymentRequest
): Promise<DebtPayment> {
  const res = await apiClient<ApiResponse<DebtPayment>>(`/debts/${uuid}/payments`, {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}
