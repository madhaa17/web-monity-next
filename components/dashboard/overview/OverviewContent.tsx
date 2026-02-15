"use client";

import type { OverviewData } from "@/hooks/useOverviewData";
import { OverviewSummaryCards } from "@/components/dashboard/overview/OverviewSummaryCards";
import { MonthlyTrendChart } from "@/components/dashboard/overview/MonthlyTrendChart";
import { ExpenseByCategoryChart } from "@/components/dashboard/overview/ExpenseByCategoryChart";
import { PortfolioByTypeCard } from "@/components/dashboard/overview/PortfolioByTypeCard";
import { RecentActivityList } from "@/components/dashboard/overview/RecentActivityList";
import { SavingGoalsProgress } from "@/components/dashboard/overview/SavingGoalsProgress";

export interface OverviewContentProps extends OverviewData {}

const DEFAULT_CURRENCY = "IDR";

export function OverviewContent({
  overview,
  portfolio,
  cashflow,
  assets,
  activities,
  savingGoals,
}: OverviewContentProps) {
  const currency = portfolio?.currency ?? DEFAULT_CURRENCY;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your financial summary, trends, and recent activity.
        </p>
      </div>

      <OverviewSummaryCards
        portfolio={portfolio}
        cashflow={cashflow}
        overview={overview}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyTrendChart data={overview?.monthlyTrend} currency={currency} />
        <ExpenseByCategoryChart data={cashflow?.expenseByCategory} currency={currency} />
      </div>

      <PortfolioByTypeCard portfolio={portfolio} assets={assets} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityList activities={activities} />
        <SavingGoalsProgress goals={savingGoals} />
      </div>
    </div>
  );
}
