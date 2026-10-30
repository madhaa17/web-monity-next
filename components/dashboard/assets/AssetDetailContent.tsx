"use client";

import Link from "next/link";
import type { Asset } from "@/lib/api/types";
import type { PriceChartPoint } from "@/lib/api/types";
import { formatCurrency, formatQuantity, formatUnitPrice } from "@/lib/format";
import { PriceChart } from "@/components/dashboard/assets/PriceChart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  STOCK: "Stock",
  LIVESTOCK: "Livestock",
  REAL_ESTATE: "Real estate",
  OTHER: "Other",
};

/** Explains a price that is not a live market price, or returns null for a live one. */
function priceNote(source: string | undefined, asOf: string | undefined, stale: boolean): string | null {
  if (source === "fallback") {
    return "Harga pasar sedang tidak tersedia, jadi nilai memakai harga beli.";
  }
  if (stale) {
    const when = asOf
      ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(asOf))
      : null;
    return when
      ? `Sumber harga sedang tidak bisa diakses. Memakai harga terakhir per ${when}.`
      : "Sumber harga sedang tidak bisa diakses. Memakai harga terakhir yang tersimpan.";
  }
  return null;
}

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
  /** Market price per unit (per share for stocks), from the API. */
  currentPrice: number | undefined;
  /** Units per lot when quantity is counted in lots (IDX stocks). */
  lotSize: number | undefined;
  priceSource: string | undefined;
  priceAsOf: string | undefined;
  priceStale: boolean;
  showProfitLoss: boolean;
  profitLoss: number;
  chartData: PriceChartPoint[] | undefined;
  /** Currency of chartData's prices (a US stock's chart is in USD). */
  chartCurrency: string;
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
  currentPrice,
  lotSize,
  priceSource,
  priceAsOf,
  priceStale,
  showProfitLoss,
  profitLoss,
  chartData,
  chartCurrency,
  chartLoading,
  chartError,
  isCrypto,
  isStock,
  symbol,
  rangeOptions,
  selectedRange,
  onRangeChange,
}: AssetDetailContentProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/assets">Assets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{asset.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{asset.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{TYPE_LABELS[asset.type] ?? asset.type}</span>
          </div>
          {asset.type === "CASH" ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="tabular-nums">
                {formatCurrency(quantity, currency)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="tabular-nums">
                  {formatQuantity(quantity)}
                  {lotSize && lotSize > 1 ? (
                    <span className="text-muted-foreground">
                      {" "}lot ({formatQuantity(quantity * lotSize)} lembar)
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost</span>
                <span className="tabular-nums">
                  {formatCurrency(totalCost, currency)}
                </span>
              </div>
            </>
          )}
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
          {(isCrypto || isStock) && currentPrice != null ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Last price{lotSize && lotSize > 1 ? " / lembar" : ""}
              </span>
              <span className="tabular-nums font-medium">
                {formatUnitPrice(currentPrice, currency)}
              </span>
            </div>
          ) : null}
          {(isCrypto || isStock) && priceNote(priceSource, priceAsOf, priceStale) ? (
            <p
              role="status"
              className="flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300"
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {priceNote(priceSource, priceAsOf, priceStale)}
            </p>
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
              currency={chartCurrency}
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
