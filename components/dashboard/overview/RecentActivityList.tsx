"use client";

import type { ActivityItem } from "@/lib/api/activities";
import { formatDate, toNumber } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface RecentActivityListProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

function formatActivityItem(item: ActivityItem): { date?: string; label: string; amount?: number } {
  const date =
    typeof item.date === "string"
      ? item.date
      : typeof item.createdAt === "string"
        ? item.createdAt
        : typeof item.created_at === "string"
          ? item.created_at
          : undefined;
  const amount =
    item.amount !== undefined || item.total !== undefined
      ? toNumber(item.amount) || toNumber(item.total)
      : undefined;
  const type = item.type ?? item.activity_type ?? item.category ?? "Activity";
  const label =
    typeof item.note === "string" && item.note
      ? item.note
      : typeof item.description === "string"
        ? item.description
        : typeof item.label === "string"
          ? item.label
          : String(type);
  return { date, label, amount };
}

export function RecentActivityList({
  activities,
  isLoading,
}: RecentActivityListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  const displayList = activities.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {displayList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-3">
            {displayList.map((item, index) => {
              const { date, label, amount } = formatActivityItem(item);
              return (
                <li
                  key={(item as { uuid?: string }).uuid ?? index}
                  className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{label}</p>
                    {date ? (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(date)}
                      </p>
                    ) : null}
                  </div>
                  {amount !== undefined ? (
                    <span className="shrink-0 text-sm tabular-nums">
                      {amount >= 0 ? "+" : ""}
                      {amount.toLocaleString("id-ID")}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
