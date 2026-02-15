"use client";

import { useQuery } from "@tanstack/react-query";
import type { CashflowSummary, FinancialOverview } from "@/lib/api/types";
import { overviewQueryOptions, cashflowQueryOptions } from "@/lib/queries/insights";
import { toNumber } from "@/lib/format";

export interface InsightsDerived {
  income: number;
  expense: number;
  net: number;
  savingRate: number;
}

export interface UseInsightsDataResult {
  overview: FinancialOverview | undefined;
  cashflow: CashflowSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  derived: InsightsDerived;
}

export function useInsightsData(month: string): UseInsightsDataResult {
  const { data: overview, isLoading: overviewLoading, isError: overviewError, error: overviewErr } = useQuery(overviewQueryOptions());
  const { data: cashflow, isLoading: cashflowLoading, isError: cashflowError, error: cashflowErr } = useQuery(cashflowQueryOptions(month));

  const isLoading = overviewLoading || cashflowLoading;
  const isError = overviewError || cashflowError;
  const error = overviewErr ?? cashflowErr;

  const income = toNumber(cashflow?.income ?? cashflow?.totalIncome);
  const expense = toNumber(cashflow?.expense ?? cashflow?.totalExpense);
  const net = toNumber(cashflow?.netSaving) ?? income - expense;
  const savingRate = toNumber(cashflow?.savingRate);

  return {
    overview,
    cashflow,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    derived: { income, expense, net, savingRate },
  };
}
