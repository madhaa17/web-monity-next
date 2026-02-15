import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  SavingGoal,
  CreateSavingGoalBody,
} from "@/lib/api/types";

export async function listSavingGoals(): Promise<SavingGoal[]> {
  const res = await apiClient<ApiResponse<SavingGoal[]>>("/saving-goals");
  return Array.isArray(res.data) ? res.data : [];
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
