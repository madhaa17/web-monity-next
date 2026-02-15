import { queryOptions } from "@tanstack/react-query";
import * as insightsApi from "@/lib/api/insights";

export function cashflowQueryKey(month?: string) {
  return ["insights", "cashflow", month ?? "current"] as const;
}

export function cashflowQueryOptions(month?: string) {
  return queryOptions({
    queryKey: cashflowQueryKey(month),
    queryFn: () => insightsApi.getCashflow(month),
  });
}

export const overviewQueryKey = ["insights", "overview"] as const;

export function overviewQueryOptions() {
  return queryOptions({
    queryKey: overviewQueryKey,
    queryFn: () => insightsApi.getOverview(),
  });
}
