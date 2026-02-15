"use client";

import type { DehydratedState } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { OverviewContent } from "@/components/dashboard/overview/OverviewContent";
import { useOverviewData } from "@/hooks/useOverviewData";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverviewHydration({ state }: { state: DehydratedState }) {
  return (
    <HydrationBoundary state={state}>
      <DashboardOverviewClient />
    </HydrationBoundary>
  );
}

function DashboardOverviewClient() {
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
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[260px] w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
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
