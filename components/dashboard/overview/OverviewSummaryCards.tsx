"use client";

import type { CashflowSummary, FinancialOverview, PortfolioSummary } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, Coins } from "lucide-react";

export interface OverviewSummaryCardsProps {
  portfolio: PortfolioSummary | undefined;
  cashflow: CashflowSummary | undefined;
  overview?: FinancialOverview | undefined;
}

const DEFAULT_CURRENCY = "IDR";

export function OverviewSummaryCards({
  portfolio,
  cashflow,
  overview,
}: OverviewSummaryCardsProps) {
  const currency = portfolio?.currency ?? DEFAULT_CURRENCY;
  const totalValue = toNumber(portfolio?.totalValue ?? overview?.totalAssets);
  const income = toNumber(cashflow?.income ?? cashflow?.totalIncome ?? overview?.monthlyIncome);
  const expense = toNumber(cashflow?.expense ?? cashflow?.totalExpense ?? overview?.monthlyExpense);
  const net = toNumber(cashflow?.netSaving ?? overview?.monthlyNetSaving) || income - expense;
  const savingRate = toNumber(cashflow?.savingRate);
  const hasNet = income > 0 || expense > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Assets value
          </CardTitle>
          <Wallet className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">
            {formatCurrency(totalValue, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income (this month)
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
            Expense (this month)
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
          <Coins className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold tabular-nums ${hasNet && net >= 0 ? "text-green-600 dark:text-green-500" : hasNet && net < 0 ? "text-red-600 dark:text-red-500" : ""}`}
          >
            {formatCurrency(net, currency)}
          </p>
          {savingRate > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3" />
              {savingRate.toFixed(0)}% saving rate
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
