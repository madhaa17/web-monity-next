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
import { Activity, ArrowDownCircle, ArrowRightLeft, ArrowUpCircle } from "lucide-react";

export interface RecentActivityListProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export type ActivityKind = "income" | "expense" | "receivable" | "payable";

function formatActivityItem(item: ActivityItem): {
  date?: string;
  label: string;
  amount?: number;
  kind: ActivityKind;
} {
  const date = item.date ?? item.createdAt ?? undefined;
  const rawAmount = toNumber(item.amount);
  const kind: ActivityKind =
    item.type === "receivable"
      ? "receivable"
      : item.type === "payable" || item.type === "debt"
        ? "payable"
        : item.type === "income"
          ? "income"
          : "expense";
  const absValue = rawAmount !== undefined && !Number.isNaN(rawAmount) ? Math.abs(rawAmount) : undefined;
  const amount =
    absValue !== undefined
      ? kind === "income" || kind === "receivable"
        ? absValue
        : -absValue
      : undefined;
  const label =
    kind === "income"
      ? (item.source ?? item.note ?? "Income")
      : kind === "receivable"
        ? (item.note ?? item.partyName ?? "Receivable")
        : kind === "payable"
          ? (item.note ?? item.partyName ?? "Debt")
          : (item.note ?? item.category ?? "Expense");
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
      const dateA = a.date ?? a.createdAt ?? "";
      const dateB = b.date ?? b.createdAt ?? "";
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
              const isReceivable = kind === "receivable";
              const isPayable = kind === "payable";
              const amountClass =
                isIncome
                  ? "text-green-600 dark:text-green-500"
                  : isReceivable
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-red-600 dark:text-red-500";
              const showArrowRightLeft = isReceivable || isPayable;
              return (
                <li
                  key={item.uuid ?? index}
                  className="flex items-center gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <span
                    className={`shrink-0 ${amountClass}`}
                    aria-hidden
                  >
                    {isIncome ? (
                      <ArrowUpCircle className="size-5" />
                    ) : showArrowRightLeft ? (
                      <ArrowRightLeft className="size-5" />
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
                      className={`shrink-0 text-sm font-medium tabular-nums ${amountClass}`}
                    >
                      {isIncome || isReceivable ? "+" : ""}
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
