"use client";

import type { PriceChartPoint } from "@/lib/api/types";
import { formatUnitPrice } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_CURRENCY = "IDR";

const chartConfig = {
  time: { label: "Date" },
  price: {
    label: "Price",
    color: "var(--chart-1)",
  },
};

const INTRADAY_SPAN_MS = 2 * 24 * 60 * 60 * 1000;

function formatTimeLabel(timeStr: string, intraday = false): string {
  const date = new Date(timeStr);
  if (Number.isNaN(date.getTime())) return timeStr;
  if (intraday) {
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "2-digit" : undefined,
  }).format(date);
}

function formatTooltipTime(timeStr: string, intraday: boolean): string {
  const date = new Date(timeStr);
  if (Number.isNaN(date.getTime())) return timeStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(intraday ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

/** Y-axis label: full price with thousands separators (4.520), compact from a million (1,7 M), decimals for small prices. */
function formatPriceTick(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e6) {
    return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 2 }).format(v);
  }
  const maximumFractionDigits =
    abs === 0 || abs >= 100 ? 0 : Math.min(8, 3 - Math.floor(Math.log10(abs)));
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits }).format(v);
}

export interface PriceChartRangeOption {
  value: string;
  label: string;
}

export interface PriceChartProps {
  data: PriceChartPoint[];
  currency?: string;
  symbol?: string;
  /** Selisih hari data terakhir (mis. 2 = harga terakhir 2 hari yang lalu). Ditampilkan sebagai keterangan. */
  dataDelayDays?: number;
  /** Opsi untuk filter range (mis. 1W, 1M). Ditampilkan sebagai Select di kanan header. */
  rangeOptions?: PriceChartRangeOption[];
  selectedRange?: string;
  onRangeChange?: (value: string) => void;
}

export function PriceChart({
  data,
  currency = DEFAULT_CURRENCY,
  symbol,
  dataDelayDays = 2,
  rangeOptions,
  selectedRange,
  onRangeChange,
}: PriceChartProps) {
  const series = Array.isArray(data) && data.length > 0 ? data : [];
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 220 : 260;
  const tickFontSize = isMobile ? 10 : 11;

  const prices = series.map((p) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const longestTick = Math.max(formatPriceTick(minPrice).length, formatPriceTick(maxPrice).length);
  const yAxisWidth = Math.max(32, longestTick * (tickFontSize - 3) + 12);

  const firstTime = series.length > 0 ? new Date(series[0].time).getTime() : NaN;
  const lastTime = series.length > 0 ? new Date(series[series.length - 1].time).getTime() : NaN;
  const intraday = lastTime - firstTime < INTRADAY_SPAN_MS;

  const firstPrice = series[0]?.price;
  const lastPrice = series[series.length - 1]?.price;
  const priceUp =
    firstPrice != null &&
    lastPrice != null &&
    lastPrice >= firstPrice;
  const lineStroke = priceUp ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)";

  const title = symbol ? `Price chart — ${symbol}` : "Price chart";
  const showRangeSelect = rangeOptions && rangeOptions.length > 0 && selectedRange != null && onRangeChange;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base">{title}</CardTitle>
          {dataDelayDays > 0 && series.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Harga terakhir hingga {dataDelayDays} hari yang lalu.
            </p>
          )}
        </div>
        {showRangeSelect && (
          <Select value={selectedRange} onValueChange={onRangeChange}>
            <SelectTrigger size="sm" className="w-[100px]">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {rangeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {series.length === 0 ? (
          <p className="flex min-h-[180px] sm:min-h-[240px] items-center justify-center text-sm text-muted-foreground">
            No chart data yet.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[200px] w-full aspect-auto"
            style={{ height: chartHeight }}
          >
            <LineChart
              data={series}
              margin={{ top: 8, right: 0, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tickFormatter={(v) => formatTimeLabel(String(v), intraday)}
                tick={{ fontSize: tickFontSize }}
                axisLine={false}
                tickLine={false}
                // Default "preserveEnd" hides the first label when it overflows the left edge.
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                domain={["auto", "auto"]}
                orientation="right"
                tickFormatter={formatPriceTick}
                tick={{ fontSize: tickFontSize }}
                axisLine={false}
                tickLine={false}
                width={yAxisWidth}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatTooltipTime(String(label), intraday)}
                    formatter={(value) => formatUnitPrice(Number(value), currency)}
                  />
                }
              />
              <Line
                type="linear"
                dataKey="price"
                name="Price"
                stroke={lineStroke}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
