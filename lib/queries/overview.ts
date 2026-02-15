import type { QueryClient } from "@tanstack/react-query";

/**
 * Invalidate all queries that the Overview dashboard depends on.
 * Call this after any mutation that changes data shown on Overview
 * (incomes, expenses, assets, saving goals) so the dashboard refetches.
 */
export function invalidateOverviewQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ["insights"] });
  queryClient.invalidateQueries({ queryKey: ["portfolio"] });
  queryClient.invalidateQueries({ queryKey: ["activities"] });
}
