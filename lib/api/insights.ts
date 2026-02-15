import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  CashflowSummary,
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
  return {
    income: pickNumber(payload, "income", "Income", "total_income", "totalIncome"),
    expense: pickNumber(payload, "expense", "Expense", "total_expense", "totalExpense"),
  };
}

export async function getOverview(): Promise<FinancialOverview> {
  const res = await apiClient<ApiResponse<FinancialOverview>>("/insights/overview");
  return res.data;
}
