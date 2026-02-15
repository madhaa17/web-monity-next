"use client";

import type { PriceChartPoint } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
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

function formatTimeLabel(timeStr: string): string {
  const date = new Date(timeStr);
  if (Number.isNaN(date.getTime())) return timeStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "2-digit" : undefined,
  }).format(date);
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
  const yAxisWidth = isMobile ? 32 : 40;

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
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tickFormatter={formatTimeLabel}
                tick={{ fontSize: tickFontSize }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}K` : String(v)
                }
                tick={{ fontSize: tickFontSize }}
                axisLine={false}
                tickLine={false}
                width={yAxisWidth}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatTimeLabel(String(label))}
                    formatter={(value) => formatCurrency(Number(value), currency)}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
