"use client";

import { OverviewContent } from "@/components/dashboard/overview/OverviewContent";
import { useOverviewData } from "@/hooks/useOverviewData";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const {
    overview,
    cashflow,
    portfolio,
    assets,
    activities,
    savingGoals,
    isPending,
    isError,
    error,
  } = useOverviewData();

  if (isPending) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 max-w-md" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-destructive">
          {error?.message ?? "Failed to load overview data."}
        </p>
      </div>
    );
  }

  return (
    <OverviewContent
      overview={overview}
      cashflow={cashflow}
      portfolio={portfolio}
      assets={assets}
      activities={activities}
      savingGoals={savingGoals}
    />
  );
}
