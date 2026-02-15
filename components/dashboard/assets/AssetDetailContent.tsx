"use client";

import Link from "next/link";
import type { Asset } from "@/lib/api/types";
import type { PriceChartPoint } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { PriceChart } from "@/components/dashboard/assets/PriceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, TrendingDown, TrendingUp } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  STOCK: "Stock",
  LIVESTOCK: "Livestock",
  REAL_ESTATE: "Real estate",
  OTHER: "Other",
};

export interface AssetDetailContentRangeOption {
  value: string;
  label: string;
}

export interface AssetDetailContentProps {
  asset: Asset;
  currency: string;
  quantity: number;
  totalCost: number;
  currentValue: number | undefined;
  showProfitLoss: boolean;
  profitLoss: number;
  chartData: PriceChartPoint[] | undefined;
  chartLoading: boolean;
  chartError: boolean;
  showChart: boolean;
  isCrypto: boolean;
  isStock: boolean;
  symbol: string;
  rangeOptions: AssetDetailContentRangeOption[];
  selectedRange: string;
  onRangeChange: (value: string) => void;
}

export function AssetDetailContent({
  asset,
  currency,
  quantity,
  totalCost,
  currentValue,
  showProfitLoss,
  profitLoss,
  chartData,
  chartLoading,
  chartError,
  showChart,
  isCrypto,
  isStock,
  symbol,
  rangeOptions,
  selectedRange,
  onRangeChange,
}: AssetDetailContentProps) {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/assets"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Assets
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{asset.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{TYPE_LABELS[asset.type] ?? asset.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <span className="tabular-nums">{quantity.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost</span>
            <span className="tabular-nums">
              {formatCurrency(totalCost, currency)}
            </span>
          </div>
          {(isCrypto || isStock) && currentValue != null ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current value</span>
              <span className="tabular-nums">
                {formatCurrency(currentValue, currency)}
              </span>
            </div>
          ) : null}
          {showProfitLoss ? (
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Profit/Loss</span>
              <span
                className={
                  profitLoss >= 0
                    ? "tabular-nums text-green-600 dark:text-green-500 font-medium"
                    : "tabular-nums text-red-600 dark:text-red-500 font-medium"
                }
              >
                {profitLoss >= 0 ? (
                  <TrendingUp className="inline-block size-4 mr-1 align-middle" />
                ) : (
                  <TrendingDown className="inline-block size-4 mr-1 align-middle" />
                )}
                {formatCurrency(profitLoss, currency)}
              </span>
            </div>
          ) : null}
          {symbol ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Symbol</span>
              <span>{symbol}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {(isCrypto || isStock) && (
        <section className="space-y-3">
          {!symbol ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Tambahkan symbol aset untuk menampilkan grafik harga.
              </CardContent>
            </Card>
          ) : chartLoading ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price chart</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[260px] w-full" />
              </CardContent>
            </Card>
          ) : chartError ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price chart</CardTitle>
              </CardHeader>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Data grafik tidak tersedia.
              </CardContent>
            </Card>
          ) : chartData && chartData.length > 0 ? (
            <PriceChart
              data={chartData}
              currency={currency}
              symbol={symbol}
              dataDelayDays={isStock ? 2 : 0}
              rangeOptions={rangeOptions}
              selectedRange={selectedRange}
              onRangeChange={onRangeChange}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price chart</CardTitle>
              </CardHeader>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No chart data yet.
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
