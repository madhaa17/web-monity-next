import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  SavingGoal,
  CreateSavingGoalBody,
  ListResponse,
} from "@/lib/api/types";

function extractListItems<T>(data: unknown): T[] {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items))
    return (data as ListResponse<T>).items;
  if (Array.isArray(data)) return data as T[];
  return [];
}

export async function listSavingGoals(): Promise<SavingGoal[]> {
  const res = await apiClient<ApiResponse<ListResponse<SavingGoal>>>("/saving-goals");
  return extractListItems<SavingGoal>(res.data);
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
