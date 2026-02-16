import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  Expense,
  CreateExpenseBody,
  ListResponse,
} from "@/lib/api/types";
import { buildListQuery, type ListDateFilterParams } from "@/lib/api/list-params";

function normalizeListResponse<T>(data: unknown): ListResponse<T> {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items)) {
    const r = data as ListResponse<T>;
    return { items: r.items, meta: r.meta };
  }
  if (Array.isArray(data)) return { items: data as T[] };
  return { items: [] };
}

export async function listExpenses(params?: ListDateFilterParams): Promise<ListResponse<Expense>> {
  const path = `/expenses${buildListQuery(params)}`;
  const res = await apiClient<ApiResponse<ListResponse<Expense>>>(path);
  return normalizeListResponse<Expense>(res.data);
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
