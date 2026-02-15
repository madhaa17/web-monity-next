import { queryOptions } from "@tanstack/react-query";
import * as pricesApi from "@/lib/api/prices";
import type { CryptoChartParams, StockChartParams } from "@/lib/api/prices";

export function cryptoChartQueryKey(symbol: string, params?: CryptoChartParams) {
  return ["prices", "crypto", "chart", symbol, params ?? {}] as const;
}

export function cryptoChartQueryOptions(symbol: string | undefined, params?: CryptoChartParams) {
  const s = typeof symbol === "string" ? symbol.trim() : "";
  return queryOptions({
    queryKey: cryptoChartQueryKey(s ?? "", params),
    queryFn: () => pricesApi.getCryptoChart(s, params),
    enabled: s.length > 0,
  });
}

export function stockChartQueryKey(symbol: string, params?: StockChartParams) {
  return ["prices", "stock", "chart", symbol, params ?? {}] as const;
}

export function stockChartQueryOptions(symbol: string | undefined, params?: StockChartParams) {
  const s = typeof symbol === "string" ? symbol.trim() : "";
  return queryOptions({
    queryKey: stockChartQueryKey(s || "", params),
    queryFn: () => pricesApi.getStockChart(s, params),
    enabled: s.length > 0,
  });
}
