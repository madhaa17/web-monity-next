import { apiClient } from "@/lib/api/client";
import { buildQueryFromParams } from "@/lib/api/list-params";
import type {
  ApiResponse,
  Receivable,
  ReceivablePayment,
  CreateReceivableRequest,
  UpdateReceivableRequest,
  CreateReceivablePaymentRequest,
  ListResponse,
} from "@/lib/api/types";

export interface ListReceivablesParams {
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

function toQueryParams(
  params?: ListReceivablesParams
): Record<string, string | number | undefined | null> {
  if (!params) return {};
  return {
    page: params.page,
    limit: params.limit,
    status: params.status,
    due_from: params.due_from,
    due_to: params.due_to,
  };
}

export async function listReceivables(
  params?: ListReceivablesParams
): Promise<ListResponse<Receivable>> {
  const path = `/receivables${buildQueryFromParams(toQueryParams(params))}`;
  const res = await apiClient<ApiResponse<ListResponse<Receivable>>>(path);
  return normalizeListResponse<Receivable>(res.data);
}

export async function getReceivable(uuid: string): Promise<Receivable> {
  const res = await apiClient<ApiResponse<Receivable>>(`/receivables/${uuid}`);
  return res.data;
}

export async function createReceivable(body: CreateReceivableRequest): Promise<Receivable> {
  const res = await apiClient<ApiResponse<Receivable>>("/receivables", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateReceivable(
  uuid: string,
  body: UpdateReceivableRequest
): Promise<Receivable> {
  const res = await apiClient<ApiResponse<Receivable>>(`/receivables/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteReceivable(uuid: string): Promise<void> {
  await apiClient<unknown>(`/receivables/${uuid}`, { method: "DELETE" });
}

export async function listReceivablePayments(uuid: string): Promise<ReceivablePayment[]> {
  const res = await apiClient<ApiResponse<ReceivablePayment[]>>(
    `/receivables/${uuid}/payments`
  );
  const data = res.data;
  return Array.isArray(data) ? data : [];
}

export async function createReceivablePayment(
  uuid: string,
  body: CreateReceivablePaymentRequest
): Promise<ReceivablePayment> {
  const res = await apiClient<ApiResponse<ReceivablePayment>>(
    `/receivables/${uuid}/payments`,
    {
      method: "POST",
      body: body as unknown as Record<string, unknown>,
    }
  );
  return res.data;
}
