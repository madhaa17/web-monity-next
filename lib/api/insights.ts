import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  CashflowSummary,
  CategoryTotal,
  FinancialOverview,
} from "@/lib/api/types";
import { toNumber } from "@/lib/format";

function pickNumber(obj: unknown, ...keys: string[]): number {
  if (obj == null || typeof obj !== "object") return 0;
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null) return toNumber(v);
  }
  return 0;
}

export async function getCashflow(month?: string): Promise<CashflowSummary> {
  const path = month
    ? `/insights/cashflow?month=${encodeURIComponent(month)}`
    : "/insights/cashflow";
  const res = await apiClient<ApiResponse<CashflowSummary>>(path);
  const payload = res.data ?? (res as unknown as Record<string, unknown>);
  const totalIncome = pickNumber(
    payload,
    "totalIncome",
    "total_income",
    "income",
    "Income"
  );
  const totalExpense = pickNumber(
    payload,
    "totalExpense",
    "total_expense",
    "expense",
    "Expense"
  );
  const netSaving = pickNumber(payload, "netSaving", "net_saving");
  const savingRate = pickNumber(payload, "savingRate", "saving_rate");
  const rawPeriod = (payload as Record<string, unknown>).period;
  const period =
    typeof rawPeriod === "string" ? rawPeriod : undefined;
  const rawCategories = (payload as Record<string, unknown>).expenseByCategory;
  const expenseByCategory = Array.isArray(rawCategories)
    ? (rawCategories as CategoryTotal[])
    : undefined;
  return {
    period,
    totalIncome,
    totalExpense,
    netSaving,
    savingRate,
    expenseByCategory,
    income: totalIncome,
    expense: totalExpense,
  };
}

export async function getOverview(): Promise<FinancialOverview> {
  const res = await apiClient<ApiResponse<FinancialOverview>>("/insights/overview");
  return res.data as FinancialOverview;
}
