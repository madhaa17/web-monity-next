import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Income, CreateIncomeBody, ListResponse } from "@/lib/api/types";

function extractListItems<T>(data: unknown): T[] {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items))
    return (data as ListResponse<T>).items;
  if (Array.isArray(data)) return data as T[];
  return [];
}

export async function listIncomes(): Promise<Income[]> {
  const res = await apiClient<ApiResponse<ListResponse<Income>>>("/incomes");
  return extractListItems<Income>(res.data);
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
