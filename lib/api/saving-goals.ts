import { apiClient } from "@/lib/api/client";
import { buildListQuery } from "@/lib/api/list-params";
import type {
  ApiResponse,
  SavingGoal,
  CreateSavingGoalBody,
  ListResponse,
} from "@/lib/api/types";

export interface ListSavingGoalsParams {
  page?: number;
  limit?: number;
}

function normalizeListResponse<T>(data: unknown): ListResponse<T> {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items)) {
    const r = data as ListResponse<T>;
    return { items: r.items, meta: r.meta };
  }
  if (Array.isArray(data)) return { items: data as T[] };
  return { items: [] };
}

export async function listSavingGoals(params?: ListSavingGoalsParams): Promise<ListResponse<SavingGoal>> {
  const path = `/saving-goals${buildListQuery(params)}`;
  const res = await apiClient<ApiResponse<ListResponse<SavingGoal>>>(path);
  return normalizeListResponse<SavingGoal>(res.data);
}

export async function getSavingGoal(uuid: string): Promise<SavingGoal> {
  const res = await apiClient<ApiResponse<SavingGoal>>(`/saving-goals/${uuid}`);
  return res.data;
}

export async function createSavingGoal(
  body: CreateSavingGoalBody
): Promise<SavingGoal> {
  const res = await apiClient<ApiResponse<SavingGoal>>("/saving-goals", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateSavingGoal(
  uuid: string,
  body: Partial<Pick<SavingGoal, "title" | "targetAmount" | "currentAmount" | "deadline">>
): Promise<SavingGoal> {
  const res = await apiClient<ApiResponse<SavingGoal>>(`/saving-goals/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteSavingGoal(uuid: string): Promise<void> {
  await apiClient<unknown>(`/saving-goals/${uuid}`, { method: "DELETE" });
}
