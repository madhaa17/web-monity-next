import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PortfolioSummary } from "@/lib/api/types";

export async function getPortfolio(currency?: string): Promise<PortfolioSummary> {
  const path = currency ? `/portfolio?currency=${encodeURIComponent(currency)}` : "/portfolio";
  const res = await apiClient<ApiResponse<PortfolioSummary>>(path);
  return res.data;
}

export async function getAssetValue(
  uuid: string,
  currency?: string
): Promise<{ value?: number; [key: string]: unknown }> {
  let path = `/portfolio/assets/${uuid}`;
  if (currency) path += `?currency=${encodeURIComponent(currency)}`;
  const res = await apiClient<ApiResponse<{ value?: number; [key: string]: unknown }>>(path);
  return res.data;
}
