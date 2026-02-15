"use client";

import { useQuery } from "@tanstack/react-query";
import type { Asset, PriceChartPoint } from "@/lib/api/types";
import { toNumber } from "@/lib/format";
import { assetQueryOptions } from "@/lib/queries/assets";
import { portfolioAssetValueQueryOptions } from "@/lib/queries/portfolio";
import { cryptoChartQueryOptions } from "@/lib/queries/prices";
import { stockChartQueryOptions } from "@/lib/queries/prices";

const DEFAULT_CURRENCY = "IDR";

export type ChartRangePresetKey = "1W" | "1M" | "3M" | "6M" | "1Y";

/** range: 5d, 1mo, 3mo, 6mo, 1y. interval: 1d, 1wk, 1mo. 1D omitted: API returns single point. */
export const CHART_RANGE_PRESETS: {
  key: ChartRangePresetKey;
  label: string;
  days: number;
  range: string;
  interval?: string;
}[] = [
  { key: "1W", label: "1W", days: 7, range: "5d", interval: "1d" },
  { key: "1M", label: "1M", days: 30, range: "1mo", interval: "1d" },
  { key: "3M", label: "3M", days: 90, range: "3mo", interval: "1wk" },
  { key: "6M", label: "6M", days: 180, range: "6mo", interval: "1wk" },
  { key: "1Y", label: "1Y", days: 365, range: "1y", interval: "1mo" },
];

export const DEFAULT_CHART_RANGE: ChartRangePresetKey = "1M";

export interface UseAssetDetailDataResult {
  asset: Asset | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  currency: string;
  symbol: string;
  isCrypto: boolean;
  isStock: boolean;
  showChart: boolean;
  chartData: PriceChartPoint[] | undefined;
  chartLoading: boolean;
  chartError: boolean;
  quantity: number;
  totalCost: number;
  currentValue: number | undefined;
  showProfitLoss: boolean;
  profitLoss: number;
}

export function useAssetDetailData(
  uuid: string,
  chartRange: ChartRangePresetKey
): UseAssetDetailDataResult {
  const {
    data: asset,
    isLoading,
    isError,
    error,
  } = useQuery(assetQueryOptions(uuid));

  const currency =
    (asset?.purchaseCurrency as string)?.trim() || DEFAULT_CURRENCY;
  const symbol = (asset?.symbol as string)?.trim();
  const isCrypto = asset?.type === "CRYPTO";
  const isStock = asset?.type === "STOCK";
  const showChart = (isCrypto || isStock) && !!symbol;

  const selectedPreset =
    CHART_RANGE_PRESETS.find((p) => p.key === chartRange) ??
    CHART_RANGE_PRESETS.find((p) => p.key === DEFAULT_CHART_RANGE) ??
    CHART_RANGE_PRESETS[0];
  const chartParams = {
    currency,
    days: selectedPreset.days,
    range: selectedPreset.range,
    interval: selectedPreset.interval,
  };

  const cryptoChartQuery = useQuery({
    ...cryptoChartQueryOptions(symbol, chartParams),
    enabled: isCrypto && !!symbol,
  });

  const stockChartQuery = useQuery({
    ...stockChartQueryOptions(symbol, chartParams),
    enabled: isStock && !!symbol,
  });

  const { data: assetValueData } = useQuery({
    ...portfolioAssetValueQueryOptions(uuid, currency),
    enabled: (isCrypto || isStock) && !!uuid,
  });

  const chartData = isCrypto
    ? cryptoChartQuery.data
    : isStock
      ? stockChartQuery.data
      : undefined;
  const chartLoading =
    showChart && (cryptoChartQuery.isLoading || stockChartQuery.isLoading);
  const chartError =
    showChart && (cryptoChartQuery.isError || stockChartQuery.isError);

  const quantity = asset ? toNumber(asset.quantity) : 0;
  const totalCost = asset ? toNumber(asset.totalCost) : 0;
  const currentValue =
    assetValueData?.value != null ? toNumber(assetValueData.value) : undefined;
  const showProfitLoss =
    (isCrypto || isStock) && totalCost > 0 && currentValue != null;
  const profitLoss = showProfitLoss ? (currentValue ?? 0) - totalCost : 0;

  return {
    asset,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    currency,
    symbol,
    isCrypto,
    isStock,
    showChart,
    chartData,
    chartLoading,
    chartError,
    quantity,
    totalCost,
    currentValue,
    showProfitLoss,
    profitLoss,
  };
}
