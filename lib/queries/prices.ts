import { queryOptions } from "@tanstack/react-query";
import * as pricesApi from "@/lib/api/prices";
import type { CryptoChartParams, PricedAssetType, StockChartParams } from "@/lib/api/prices";

export function symbolSearchQueryOptions(type: PricedAssetType, q: string) {
  const query = q.trim();
  return queryOptions({
    queryKey: ["prices", "search", type, query.toLowerCase()] as const,
    queryFn: () => pricesApi.searchSymbols(type, query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function priceQuoteQueryOptions(type: PricedAssetType, symbol: string | undefined) {
  const s = symbol?.trim().toUpperCase() ?? "";
  return queryOptions({
    queryKey: ["prices", "quote", type, s] as const,
    queryFn: () => pricesApi.getPriceQuote(type, s),
    enabled: s.length > 0,
    staleTime: 60 * 1000,
    retry: false,
  });
}

/**
 * Keep showing the previous range of the same symbol while the next one loads, instead of an empty
 * chart. Chart keys are ["prices", type, "chart", symbol, params].
 */
function keepPreviousRange(symbol: string) {
  return <T>(previous: T | undefined, previousQuery?: { queryKey: readonly unknown[] }) =>
    previousQuery?.queryKey[3] === symbol ? previous : undefined;
}

export function cryptoChartQueryKey(symbol: string, params?: CryptoChartParams) {
  return ["prices", "crypto", "chart", symbol, params ?? {}] as const;
}

export function cryptoChartQueryOptions(symbol: string | undefined, params?: CryptoChartParams) {
  const s = typeof symbol === "string" ? symbol.trim() : "";
  return queryOptions({
    queryKey: cryptoChartQueryKey(s ?? "", params),
    queryFn: () => pricesApi.getCryptoChart(s, params),
    enabled: s.length > 0,
    placeholderData: keepPreviousRange(s),
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
    placeholderData: keepPreviousRange(s),
  });
}
