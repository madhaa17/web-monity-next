"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyTrendChart } from "@/components/dashboard/overview/MonthlyTrendChart";
import { ExpenseByCategoryChart } from "@/components/dashboard/overview/ExpenseByCategoryChart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { CashflowSummary, FinancialOverview } from "@/lib/api/types";
import type { InsightsDerived } from "@/hooks/useInsightsData";
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, TrendingUp } from "lucide-react";

const DEFAULT_CURRENCY = "IDR";

export interface InsightsContentProps {
  overview: FinancialOverview | undefined;
  cashflow: CashflowSummary | undefined;
  month: string;
  onMonthChange: (value: string) => void;
  derived: InsightsDerived;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function InsightsContent({
  overview,
  cashflow,
  month,
  onMonthChange,
  derived,
  isLoading,
  isError,
  error,
}: InsightsContentProps) {
  const currency = DEFAULT_CURRENCY;
  const { income, expense, net, savingRate } = derived;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cashflow and trends by month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="insights-month" className="text-sm text-muted-foreground">
            Month
          </label>
          <input
            id="insights-month"
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {isError && error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Income
              </CardTitle>
              <ArrowUpCircle className="size-4 text-green-600 dark:text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-500">
                {formatCurrency(income, currency)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expense
              </CardTitle>
              <ArrowDownCircle className="size-4 text-red-600 dark:text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-500">
                {formatCurrency(expense, currency)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net saving
              </CardTitle>
              <PiggyBank className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold tabular-nums ${net >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
              >
                {formatCurrency(net, currency)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saving rate
              </CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                {savingRate > 0 ? `${savingRate.toFixed(0)}%` : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyTrendChart data={overview?.monthlyTrend} currency={currency} />
        <ExpenseByCategoryChart data={cashflow?.expenseByCategory} currency={currency} />
      </div>
    </div>
  );
}
