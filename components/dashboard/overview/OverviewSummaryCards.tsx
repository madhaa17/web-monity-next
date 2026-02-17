"use client";

import Link from "next/link";
import type { CashflowSummary, FinancialOverview, PortfolioSummary } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, Coins, HandCoins, ArrowRightLeft } from "lucide-react";

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
  const totalDebt = toNumber(overview?.totalDebt);
  const totalReceivable = toNumber(overview?.totalReceivable);
  const debtOverdueCount = overview?.debtOverdueCount ?? 0;
  const receivableOverdueCount = overview?.receivableOverdueCount ?? 0;

  const amountClass =
    "text-sm font-bold tabular-nums min-w-0 @[140px]:text-base @[180px]:text-lg @[220px]:text-xl @[280px]:text-2xl";

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <Card className="border-border/80 @container">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Assets value
          </CardTitle>
          <Wallet className="size-4 shrink-0 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className={amountClass}>
            {formatCurrency(totalValue, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/80 @container">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income (this month)
          </CardTitle>
          <ArrowUpCircle className="size-4 shrink-0 text-green-600 dark:text-green-500" />
        </CardHeader>
        <CardContent>
          <p className={`${amountClass} text-green-600 dark:text-green-500`}>
            {formatCurrency(income, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/80 @container">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Expense (this month)
          </CardTitle>
          <ArrowDownCircle className="size-4 shrink-0 text-red-600 dark:text-red-500" />
        </CardHeader>
        <CardContent>
          <p className={`${amountClass} text-red-600 dark:text-red-500`}>
            {formatCurrency(expense, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/80 @container">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net saving
          </CardTitle>
          <Coins className="size-4 shrink-0 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p
            className={`${amountClass} ${hasNet && net >= 0 ? "text-green-600 dark:text-green-500" : hasNet && net < 0 ? "text-red-600 dark:text-red-500" : ""}`}
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
      <Link href="/dashboard/debts">
        <Card className="border-border/80 @container transition-colors hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total debt
            </CardTitle>
            <HandCoins className="size-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={amountClass}>
              {formatCurrency(totalDebt, currency)}
            </p>
            {debtOverdueCount > 0 && (
              <p className="mt-1 text-xs text-destructive">
                {debtOverdueCount} overdue
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
      <Link href="/dashboard/receivables">
        <Card className="border-border/80 @container transition-colors hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total receivable
            </CardTitle>
            <ArrowRightLeft className="size-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`${amountClass} text-green-600 dark:text-green-500`}>
              {formatCurrency(totalReceivable, currency)}
            </p>
            {receivableOverdueCount > 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                {receivableOverdueCount} overdue
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
