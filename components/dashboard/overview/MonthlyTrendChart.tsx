"use client";

import React from "react";
import type { MonthlyTrendPoint } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_CURRENCY = "IDR";

const chartConfig = {
  month: { label: "Month" },
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expense",
    color: "var(--destructive)",
  },
};

function formatMonthLabel(monthStr: string): string {
  const [y, m] = monthStr.split("-");
  if (!m) return monthStr;
  const date = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(date);
}

export interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[] | undefined;
  currency?: string;
}

export function MonthlyTrendChart({ data, currency = DEFAULT_CURRENCY }: MonthlyTrendChartProps) {
  const series = Array.isArray(data) && data.length > 0 ? data : [];
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 220 : 260;
  const tickFontSize = isMobile ? 10 : 11;
  const yAxisWidth = isMobile ? 32 : 40;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Income vs expense (last 12 months)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {series.length === 0 ? (
          <p className="flex min-h-[180px] sm:min-h-[240px] items-center justify-center text-sm text-muted-foreground">
            No trend data yet.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[200px] w-full aspect-auto"
            style={{ height: chartHeight }}
          >
            <AreaChart
              data={series}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonthLabel}
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
                    labelFormatter={(label) => formatMonthLabel(String(label))}
                    formatter={(value, name, item) => {
                      const color = (item.payload as { fill?: string })?.fill ?? item.color ?? "var(--muted-foreground)";
                      return (
                        <div className="flex w-full flex-wrap items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px] border border-[var(--color-border)] bg-[var(--color-bg)]"
                            style={
                              {
                                "--color-bg": color,
                                "--color-border": color,
                              } as React.CSSProperties
                            }
                          />
                          <span className="text-muted-foreground">{name}</span>
                          <span className="ml-auto font-mono font-medium tabular-nums">
                            {formatCurrency(Number(value), currency)}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                fill="var(--chart-1)"
                fillOpacity={0.4}
                stroke="var(--chart-1)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                fill="var(--destructive)"
                fillOpacity={0.4}
                stroke="var(--destructive)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
