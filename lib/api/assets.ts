import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Asset, CreateAssetBody } from "@/lib/api/types";

export async function listAssets(): Promise<Asset[]> {
  const res = await apiClient<ApiResponse<Asset[]>>("/assets");
  return Array.isArray(res.data) ? res.data : [];
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
