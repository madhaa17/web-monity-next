import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Category, CategoryBody, CategoryType } from "@/lib/api/types";

export async function listCategories(type?: CategoryType): Promise<Category[]> {
  const path = type ? `/categories?type=${type}` : "/categories";
  const res = await apiClient<ApiResponse<Category[]>>(path);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createCategory(body: CategoryBody): Promise<Category> {
  const res = await apiClient<ApiResponse<Category>>("/categories", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

/** Changes name and/or color; an empty color clears it. */
export async function updateCategory(
  uuid: string,
  body: Partial<Pick<CategoryBody, "name" | "color">>
): Promise<Category> {
  const res = await apiClient<ApiResponse<Category>>(`/categories/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

/** Deletes a category; when it is still in use, its transactions move to reassignTo first. */
export async function deleteCategory(uuid: string, reassignTo?: string): Promise<void> {
  const query = reassignTo ? `?reassign_to=${encodeURIComponent(reassignTo)}` : "";
  await apiClient<unknown>(`/categories/${uuid}${query}`, { method: "DELETE" });
}
