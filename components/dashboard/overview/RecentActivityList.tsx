"use client";

import type { ActivityItem } from "@/lib/api/activities";
import { formatDate, toNumber } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export interface RecentActivityListProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

type ActivityKind = "income" | "expense";

const EXPENSE_CATEGORIES = [
  "FOOD", "TRANSPORT", "HOUSING", "UTILITIES", "HEALTH",
  "ENTERTAINMENT", "SHOPPING", "OTHER",
];

function formatActivityItem(item: ActivityItem): {
  date?: string;
  label: string;
  amount?: number;
  kind: ActivityKind;
} {
  const date =
    typeof item.date === "string"
      ? item.date
      : typeof item.createdAt === "string"
        ? item.createdAt
        : typeof item.created_at === "string"
          ? item.created_at
          : undefined;
  const rawAmount =
    item.amount !== undefined || item.total !== undefined
      ? toNumber(item.amount) || toNumber(item.total)
      : undefined;
  const typeRaw = (item.type ?? item.activity_type ?? item.kind ?? "").toString().toLowerCase();
  const category = (item.category ?? "").toString().toUpperCase();
  const isExpense =
    typeRaw === "expense" ||
    typeRaw === "out" ||
    EXPENSE_CATEGORIES.includes(category);
  const isIncome =
    typeRaw === "income" ||
    typeRaw === "in" ||
    (!!item.source && !isExpense) ||
    (!isExpense && rawAmount !== undefined && rawAmount >= 0);
  const kind: ActivityKind = isExpense ? "expense" : isIncome ? "income" : "expense";
  const absValue = rawAmount !== undefined ? Math.abs(rawAmount) : undefined;
  const amount =
    absValue !== undefined
      ? kind === "income"
        ? absValue
        : -absValue
      : undefined;
  const label =
    kind === "income"
      ? (typeof item.source === "string" && item.source
          ? item.source
          : typeof item.note === "string" && item.note
            ? item.note
            : typeof item.label === "string"
              ? item.label
              : "Income")
      : (typeof item.note === "string" && item.note
          ? item.note
          : typeof item.description === "string"
            ? item.description
            : typeof item.label === "string"
              ? item.label
              : category || "Expense");
  return { date, label, amount, kind };
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

  const displayList = [...activities]
    .sort((a, b) => {
      const dateA = (a.date ?? a.createdAt ?? a.created_at ?? "") as string;
      const dateB = (b.date ?? b.createdAt ?? b.created_at ?? "") as string;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <p className="text-xs text-muted-foreground">Income & expense today</p>
      </CardHeader>
      <CardContent>
        {displayList.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Activity />
              </EmptyMedia>
              <EmptyTitle>No activity today</EmptyTitle>
              <EmptyDescription>
                Income and expense for today will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {displayList.map((item, index) => {
              const { date, label, amount, kind } = formatActivityItem(item);
              const isIncome = kind === "income";
              return (
                <li
                  key={(item as { uuid?: string }).uuid ?? index}
                  className="flex items-center gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <span
                    className={`shrink-0 ${isIncome ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
                    aria-hidden
                  >
                    {isIncome ? (
                      <ArrowUpCircle className="size-5" />
                    ) : (
                      <ArrowDownCircle className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{label}</p>
                    {date ? (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(date)}
                      </p>
                    ) : null}
                  </div>
                  {amount !== undefined ? (
                    <span
                      className={`shrink-0 text-sm font-medium tabular-nums ${isIncome ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
                    >
                      {isIncome ? "+" : ""}
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
