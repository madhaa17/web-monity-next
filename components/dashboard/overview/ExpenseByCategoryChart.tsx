"use client";

import type { CategoryTotal } from "@/lib/api/types";
import { categoryColor } from "@/lib/category-color";
import { formatCurrency, toNumber } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

const DEFAULT_CURRENCY = "IDR";

const chartConfig = {
  name: { label: "Category" },
  total: { label: "Total" },
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
    name: d.category,
    total: toNumber(d.total),
    percentage: d.percentage,
    // Same color as the category's dot on the incomes/expenses pages.
    fill: categoryColor({ color: d.color, uuid: d.categoryUuid, name: d.category }),
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
                {chartData.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
