"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  useAssetDetailData,
  DEFAULT_CHART_RANGE,
  CHART_RANGE_PRESETS,
  type ChartRangePresetKey,
} from "@/hooks/useAssetDetailData";
import { AssetDetailContent } from "@/components/dashboard/assets/AssetDetailContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssetDetailPage() {
  const params = useParams();
  const uuid = typeof params.uuid === "string" ? params.uuid : "";
  const [chartRange, setChartRange] = useState<ChartRangePresetKey>(DEFAULT_CHART_RANGE);

  const {
    asset,
    isLoading,
    isError,
    error,
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
  } = useAssetDetailData(uuid, chartRange);

  if (!uuid) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/assets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Assets
        </Link>
        <p className="text-sm text-destructive">Invalid asset.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/assets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Assets
        </Link>
        <p className="text-sm text-destructive">
          {error?.message ?? "Asset tidak ditemukan."}
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/assets">Kembali ke daftar asset</Link>
        </Button>
      </div>
    );
  }

  return (
    <AssetDetailContent
      asset={asset}
      currency={currency}
      quantity={quantity}
      totalCost={totalCost}
      currentValue={currentValue}
      showProfitLoss={showProfitLoss}
      profitLoss={profitLoss}
      chartData={chartData}
      chartLoading={chartLoading}
      chartError={chartError}
      showChart={showChart}
      isCrypto={isCrypto}
      isStock={isStock}
      symbol={symbol}
      rangeOptions={CHART_RANGE_PRESETS.map((p) => ({ value: p.key, label: p.label }))}
      selectedRange={chartRange}
      onRangeChange={(v) => setChartRange(v as ChartRangePresetKey)}
    />
  );
}
