"use client";

import type { CashflowSummary, PortfolioSummary } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface OverviewSummaryCardsProps {
  portfolio: PortfolioSummary | undefined;
  cashflow: CashflowSummary | undefined;
}

const DEFAULT_CURRENCY = "IDR";

export function OverviewSummaryCards({
  portfolio,
  cashflow,
}: OverviewSummaryCardsProps) {
  const currency = portfolio?.currency ?? DEFAULT_CURRENCY;
  const totalValue = toNumber(portfolio?.totalValue);
  const income = toNumber(cashflow?.income);
  const expense = toNumber(cashflow?.expense);
  const net = income - expense;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Portfolio value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {formatCurrency(totalValue, currency)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income (this month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-500">
            {formatCurrency(income, currency)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Expense (this month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-500">
            {formatCurrency(expense, currency)}
          </p>
          {income > 0 || expense > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Net: {formatCurrency(net, currency)}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
