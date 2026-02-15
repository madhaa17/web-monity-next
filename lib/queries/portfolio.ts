import { queryOptions } from "@tanstack/react-query";
import * as portfolioApi from "@/lib/api/portfolio";

export function portfolioQueryKey(currency?: string) {
  return ["portfolio", currency ?? "default"] as const;
}

export function portfolioQueryOptions(currency?: string) {
  return queryOptions({
    queryKey: portfolioQueryKey(currency),
    queryFn: () => portfolioApi.getPortfolio(currency),
  });
}

export function portfolioAssetValueQueryKey(uuid: string, currency?: string) {
  return ["portfolio", "asset", uuid, currency ?? "default"] as const;
}

export function portfolioAssetValueQueryOptions(uuid: string, currency?: string) {
  return queryOptions({
    queryKey: portfolioAssetValueQueryKey(uuid, currency),
    queryFn: () => portfolioApi.getAssetValue(uuid, currency),
  });
}
