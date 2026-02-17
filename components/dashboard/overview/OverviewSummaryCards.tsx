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
import { Button } from "@/components/ui/button";
import { useShowAmountStore } from "@/stores/useShowAmountStore";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Coins, HandCoins, ArrowRightLeft, Eye, EyeOff } from "lucide-react";

const MASKED_AMOUNT = "••••••••";

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
  const showAmount = useShowAmountStore((s) => s.showAmount);
  const toggleShowAmount = useShowAmountStore((s) => s.toggleShowAmount);
  const currency = portfolio?.currency ?? DEFAULT_CURRENCY;
  const totalValue = toNumber(portfolio?.totalValue ?? overview?.totalAssets);
  const income = toNumber(cashflow?.income ?? cashflow?.totalIncome ?? overview?.monthlyIncome);
  const expense = toNumber(cashflow?.expense ?? cashflow?.totalExpense ?? overview?.monthlyExpense);
  const net = toNumber(cashflow?.netSaving ?? overview?.monthlyNetSaving) || income - expense;
  const hasNet = income > 0 || expense > 0;
  const totalDebt = toNumber(overview?.totalDebt);
  const totalReceivable = toNumber(overview?.totalReceivable);
  const debtOverdueCount = overview?.debtOverdueCount ?? 0;
  const receivableOverdueCount = overview?.receivableOverdueCount ?? 0;

  const amountClass =
    "text-sm font-bold tabular-nums min-w-0 @[140px]:text-base @[180px]:text-lg @[220px]:text-xl @[280px]:text-2xl";

  const displayAmount = (value: number, curr: string) =>
    showAmount ? formatCurrency(value, curr) : MASKED_AMOUNT;

  const titleClass = "min-w-0 truncate text-sm font-medium text-muted-foreground";

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6 items-stretch">
      <Card className="h-full border-border/80 @container flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className={titleClass}>
            Total Assets value
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground "
              onClick={toggleShowAmount}
              aria-label={showAmount ? "Hide amounts" : "Show amounts"}
            >
              {showAmount ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </Button>
            <Wallet className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className={amountClass}>
            {displayAmount(totalValue, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="h-full border-border/80 @container flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className={titleClass}>
            Income (this month)
          </CardTitle>
          <ArrowUpCircle className="size-4 shrink-0 text-green-600 dark:text-green-500" />
        </CardHeader>
        <CardContent>
          <p
            className={`${amountClass} ${showAmount ? "text-green-600 dark:text-green-500" : "text-foreground"}`}
          >
            {displayAmount(income, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="h-full border-border/80 @container flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className={titleClass}>
            Expense (this month)
          </CardTitle>
          <ArrowDownCircle className="size-4 shrink-0 text-red-600 dark:text-red-500" />
        </CardHeader>
        <CardContent>
          <p
            className={`${amountClass} ${showAmount ? "text-red-600 dark:text-red-500" : "text-foreground"}`}
          >
            {displayAmount(expense, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="h-full border-border/80 @container flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className={titleClass}>
            Net saving
          </CardTitle>
          <Coins className="size-4 shrink-0 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p
            className={`${amountClass} ${showAmount ? (hasNet && net >= 0 ? "text-green-600 dark:text-green-500" : hasNet && net < 0 ? "text-red-600 dark:text-red-500" : "") : "text-foreground"}`}
          >
            {displayAmount(net, currency)}
          </p>
        </CardContent>
      </Card>
      <Link href="/dashboard/debts" className="h-full min-h-0">
        <Card className="h-full border-border/80 @container flex flex-col transition-colors hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className={titleClass}>
              Total debt
            </CardTitle>
            <HandCoins className="size-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p
              className={`${amountClass} ${showAmount ? "text-red-600 dark:text-red-500" : "text-foreground"}`}
            >
              {displayAmount(totalDebt, currency)}
            </p>
            {debtOverdueCount > 0 && (
              <p className="mt-1 text-xs text-destructive">
                {debtOverdueCount} overdue
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
      <Link href="/dashboard/receivables" className="h-full min-h-0">
        <Card className="h-full border-border/80 @container flex flex-col transition-colors hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className={titleClass}>
              Total receivable
            </CardTitle>
            <ArrowRightLeft className="size-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p
              className={`${amountClass} ${showAmount ? "text-green-600 dark:text-green-500" : "text-foreground"}`}
            >
              {displayAmount(totalReceivable, currency)}
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
