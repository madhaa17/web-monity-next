import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Income, CreateIncomeBody, ListResponse } from "@/lib/api/types";
import { buildListQuery, type ListDateFilterParams } from "@/lib/api/list-params";

function normalizeListResponse<T>(data: unknown): ListResponse<T> {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items)) {
    const r = data as ListResponse<T>;
    return { items: r.items, meta: r.meta };
  }
  if (Array.isArray(data)) return { items: data as T[] };
  return { items: [] };
}

export async function listIncomes(params?: ListDateFilterParams): Promise<ListResponse<Income>> {
  const path = `/incomes${buildListQuery(params)}`;
  const res = await apiClient<ApiResponse<ListResponse<Income>>>(path);
  return normalizeListResponse<Income>(res.data);
}

export async function getIncome(uuid: string): Promise<Income> {
  const res = await apiClient<ApiResponse<Income>>(`/incomes/${uuid}`);
  return res.data;
}

export async function createIncome(body: CreateIncomeBody): Promise<Income> {
  const res = await apiClient<ApiResponse<Income>>("/incomes", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateIncome(
  uuid: string,
  body: Partial<Pick<Income, "amount" | "note" | "source" | "date">>
): Promise<Income> {
  const res = await apiClient<ApiResponse<Income>>(`/incomes/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteIncome(uuid: string): Promise<void> {
  await apiClient<unknown>(`/incomes/${uuid}`, { method: "DELETE" });
}
