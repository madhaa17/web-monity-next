import { apiClient } from "@/lib/api/client";
import type { ApiResponse, AssetValue, PortfolioSummary } from "@/lib/api/types";

export async function getPortfolio(currency?: string): Promise<PortfolioSummary> {
  const path = currency ? `/portfolio?currency=${encodeURIComponent(currency)}` : "/portfolio";
  const res = await apiClient<ApiResponse<PortfolioSummary>>(path);
  return res.data;
}

export async function getAssetValue(
  uuid: string,
  currency?: string
): Promise<AssetValue> {
  let path = `/portfolio/assets/${uuid}`;
  if (currency) path += `?currency=${encodeURIComponent(currency)}`;
  const res = await apiClient<ApiResponse<AssetValue>>(path);
  return res.data;
}
