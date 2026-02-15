import { redirect } from "next/navigation";
import { dehydrate } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api/types";
import type { FinancialOverview } from "@/lib/api/types";
import { getServerToken, serverFetch } from "@/lib/api/server-client";
import { makeQueryClient } from "@/lib/queries/client";
import { overviewQueryKey } from "@/lib/queries/insights";
import { DashboardOverviewHydration } from "@/components/dashboard/DashboardOverviewHydration";

export default async function DashboardPage() {
  const token = await getServerToken();
  if (!token) {
    redirect("/login");
  }

  const queryClient = makeQueryClient();
  try {
    const res = await serverFetch<ApiResponse<FinancialOverview>>("/insights/overview");
    if (res?.data) {
      queryClient.setQueryData(overviewQueryKey, res.data);
    }
  } catch {
    // Prefetch best-effort; client will refetch on mount if needed
  }

  const dehydratedState = dehydrate(queryClient);

  return <DashboardOverviewHydration state={dehydratedState} />;
}
