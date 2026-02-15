"use client";

import { useQueries } from "@tanstack/react-query";
import type { ActivityItem } from "@/lib/api/activities";
import type {
  Asset,
  CashflowSummary,
  FinancialOverview,
  PortfolioSummary,
  SavingGoal,
} from "@/lib/api/types";
import { cashflowQueryOptions, overviewQueryOptions } from "@/lib/queries/insights";
import { portfolioQueryOptions } from "@/lib/queries/portfolio";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { getActivitiesThisMonthParams } from "@/lib/api/activities";
import { activitiesQueryOptions } from "@/lib/queries/activities";
import { savingGoalsQueryOptions } from "@/lib/queries/saving-goals";

function currentMonthParam(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export interface OverviewData {
  overview: FinancialOverview | undefined;
  cashflow: CashflowSummary | undefined;
  portfolio: PortfolioSummary | undefined;
  assets: Asset[];
  activities: ActivityItem[];
  savingGoals: SavingGoal[];
}

export interface UseOverviewDataResult extends OverviewData {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export function useOverviewData(): UseOverviewDataResult {
  const month = currentMonthParam();

  const [
    overviewResult,
    cashflowResult,
    portfolioResult,
    assetsResult,
    activitiesResult,
    savingGoalsResult,
  ] = useQueries({
    queries: [
      overviewQueryOptions(),
      cashflowQueryOptions(month),
      portfolioQueryOptions(),
      assetsQueryOptions(),
      activitiesQueryOptions(getActivitiesThisMonthParams()),
      savingGoalsQueryOptions(),
    ],
  });

  const isPending =
    overviewResult.isPending ||
    cashflowResult.isPending ||
    portfolioResult.isPending ||
    assetsResult.isPending ||
    activitiesResult.isPending ||
    savingGoalsResult.isPending;

  const firstError =
    overviewResult.error ||
    cashflowResult.error ||
    portfolioResult.error ||
    assetsResult.error ||
    activitiesResult.error ||
    savingGoalsResult.error;

  const isError =
    overviewResult.isError ||
    cashflowResult.isError ||
    portfolioResult.isError ||
    assetsResult.isError ||
    activitiesResult.isError ||
    savingGoalsResult.isError;

  return {
    overview: overviewResult.data,
    cashflow: cashflowResult.data,
    portfolio: portfolioResult.data,
    assets: Array.isArray(assetsResult.data) ? assetsResult.data : [],
    activities: Array.isArray(activitiesResult.data) ? activitiesResult.data : [],
    savingGoals: Array.isArray(savingGoalsResult.data) ? savingGoalsResult.data : [],
    isPending,
    isError,
    error: firstError instanceof Error ? firstError : null,
  };
}
