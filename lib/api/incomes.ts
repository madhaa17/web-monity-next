import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Income, CreateIncomeBody } from "@/lib/api/types";

export async function listIncomes(): Promise<Income[]> {
  const res = await apiClient<ApiResponse<Income[]>>("/incomes");
  return Array.isArray(res.data) ? res.data : [];
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
