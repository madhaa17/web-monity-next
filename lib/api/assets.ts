import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Asset, CreateAssetBody, ListResponse } from "@/lib/api/types";

function extractListItems<T>(data: unknown): T[] {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items))
    return (data as ListResponse<T>).items;
  if (Array.isArray(data)) return data as T[];
  return [];
}

export async function listAssets(): Promise<Asset[]> {
  const res = await apiClient<ApiResponse<ListResponse<Asset>>>("/assets");
  return extractListItems<Asset>(res.data);
}

export async function getAsset(uuid: string): Promise<Asset> {
  const res = await apiClient<ApiResponse<Asset>>(`/assets/${uuid}`);
  return res.data;
}

export async function createAsset(body: CreateAssetBody): Promise<Asset> {
  const res = await apiClient<ApiResponse<Asset>>("/assets", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateAsset(
  uuid: string,
  body: Partial<Pick<Asset, "name" | "quantity" | "notes">>
): Promise<Asset> {
  const res = await apiClient<ApiResponse<Asset>>(`/assets/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteAsset(uuid: string): Promise<void> {
  await apiClient<unknown>(`/assets/${uuid}`, { method: "DELETE" });
}
