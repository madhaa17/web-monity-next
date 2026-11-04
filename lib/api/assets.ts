import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Asset, CreateAssetBody, ListResponse } from "@/lib/api/types";

function extractListItems<T>(data: unknown): T[] {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items))
    return (data as ListResponse<T>).items;
  if (Array.isArray(data)) return data as T[];
  return [];
}

// Backend max page size; the list endpoint defaults to 20, which would silently drop older assets.
const ASSETS_PAGE_LIMIT = 100;

/** All of the user's assets, fetched page by page (callers rely on the full set, e.g. finding CASH assets). */
export async function listAssets(): Promise<Asset[]> {
  const all: Asset[] = [];
  for (let page = 1; ; page++) {
    const res = await apiClient<ApiResponse<ListResponse<Asset>>>(
      `/assets?page=${page}&limit=${ASSETS_PAGE_LIMIT}`,
    );
    const items = extractListItems<Asset>(res.data);
    all.push(...items);
    const totalPages = res.data?.meta?.totalPages ?? 1;
    if (page >= totalPages || items.length < ASSETS_PAGE_LIMIT) return all;
  }
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
  body: Partial<Pick<Asset, "name" | "quantity" | "symbol" | "notes">>
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
