import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  Expense,
  CreateExpenseBody,
} from "@/lib/api/types";

export async function listExpenses(): Promise<Expense[]> {
  const res = await apiClient<ApiResponse<Expense[]>>("/expenses");
  return Array.isArray(res.data) ? res.data : [];
}

export async function getExpense(uuid: string): Promise<Expense> {
  const res = await apiClient<ApiResponse<Expense>>(`/expenses/${uuid}`);
  return res.data;
}

export async function createExpense(body: CreateExpenseBody): Promise<Expense> {
  const res = await apiClient<ApiResponse<Expense>>("/expenses", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateExpense(
  uuid: string,
  body: Partial<Pick<Expense, "amount" | "note" | "category" | "date">>
): Promise<Expense> {
  const res = await apiClient<ApiResponse<Expense>>(`/expenses/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteExpense(uuid: string): Promise<void> {
  await apiClient<unknown>(`/expenses/${uuid}`, { method: "DELETE" });
}
