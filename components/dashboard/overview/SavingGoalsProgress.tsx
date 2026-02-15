"use client";

import type { SavingGoal } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/format";
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
import { Target } from "lucide-react";

export interface SavingGoalsProgressProps {
  goals: SavingGoal[];
  isLoading?: boolean;
}

export function SavingGoalsProgress({
  goals,
  isLoading,
}: SavingGoalsProgressProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saving goals</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {[1, 2].map((i) => (
              <li key={i}>
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saving goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Target />
              </EmptyMedia>
              <EmptyTitle>No saving goals yet</EmptyTitle>
              <EmptyDescription>
                Create a saving goal to track your progress.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saving goals</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {goals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.min(
                    100,
                    (goal.currentAmount / goal.targetAmount) * 100
                  )
                : 0;
            return (
              <li key={goal.uuid}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(goal.currentAmount)} /{" "}
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {goal.deadline ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deadline: {formatDate(goal.deadline)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
