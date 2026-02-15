"use client";

import type { OverviewData } from "@/hooks/useOverviewData";
import { OverviewSummaryCards } from "@/components/dashboard/overview/OverviewSummaryCards";
import { PortfolioByTypeCard } from "@/components/dashboard/overview/PortfolioByTypeCard";
import { RecentActivityList } from "@/components/dashboard/overview/RecentActivityList";
import { SavingGoalsProgress } from "@/components/dashboard/overview/SavingGoalsProgress";

export interface OverviewContentProps extends OverviewData {}

export function OverviewContent({
  portfolio,
  cashflow,
  assets,
  activities,
  savingGoals,
}: OverviewContentProps) {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <OverviewSummaryCards portfolio={portfolio} cashflow={cashflow} />

      <PortfolioByTypeCard portfolio={portfolio} assets={assets} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityList activities={activities} />
        <SavingGoalsProgress goals={savingGoals} />
      </div>
    </div>
  );
}
