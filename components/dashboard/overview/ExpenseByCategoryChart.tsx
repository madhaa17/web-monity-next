"use client";

import type { CategoryTotal } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

const DEFAULT_CURRENCY = "IDR";

const chartConfig = {
  name: { label: "Category" },
  total: { label: "Total" },
};

/** Warna chart dari globals.css (--chart-1 s.d. --chart-5) */
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Food",
  TRANSPORT: "Transport",
  HOUSING: "Housing",
  UTILITIES: "Utilities",
  HEALTH: "Health",
  ENTERTAINMENT: "Entertainment",
  SHOPPING: "Shopping",
  OTHER: "Other",
};

export interface ExpenseByCategoryChartProps {
  data: CategoryTotal[] | undefined;
  currency?: string;
}

export function ExpenseByCategoryChart({
  data,
  currency = DEFAULT_CURRENCY,
}: ExpenseByCategoryChartProps) {
  const items = Array.isArray(data) && data.length > 0 ? data : [];
  const chartData = items.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    total: d.total,
    percentage: d.percentage,
  }));
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 220 : 260;
  const tickFontSize = isMobile ? 10 : 11;
  const yAxisWidth = isMobile ? 56 : 80;
  const maxBarSize = isMobile ? 20 : 28;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Expense by category (this month)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {chartData.length === 0 ? (
          <p className="flex min-h-[180px] sm:min-h-[240px] items-center justify-center text-sm text-muted-foreground">
            No expense data yet.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[200px] w-full aspect-auto"
            style={{ height: chartHeight }}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}K` : String(v)
                }
                tick={{ fontSize: tickFontSize }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: tickFontSize }}
                axisLine={false}
                tickLine={false}
                width={yAxisWidth}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, _item, _index, payload) => {
                      const pct = (payload as { percentage?: number })?.percentage;
                      const parts = [formatCurrency(Number(value), currency)];
                      if (pct != null && !Number.isNaN(pct)) {
                        parts.push(`(${pct.toFixed(0)}%)`);
                      }
                      return parts.join(" ");
                    }}
                  />
                }
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={maxBarSize}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
