"use client";

import type { SavingGoal } from "@/lib/api/types";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Pencil, Target, Trash2 } from "lucide-react";

export interface SavingGoalListProps {
  goals: SavingGoal[];
  isLoading?: boolean;
  onEdit: (goal: SavingGoal) => void;
  onDelete: (goal: SavingGoal) => void;
}

export function SavingGoalList({
  goals,
  isLoading,
  onEdit,
  onDelete,
}: SavingGoalListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Title</th>
              <th className="p-3 text-right font-medium">Progress</th>
              <th className="p-3 text-left font-medium">Deadline</th>
              <th className="w-[120px] p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b">
                <td colSpan={4} className="h-12 animate-pulse bg-muted/30 p-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Empty className="py-12">
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
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">Title</th>
            <th className="p-3 text-right font-medium">Progress</th>
            <th className="p-3 text-left font-medium">Deadline</th>
            <th className="w-[120px] p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => {
            const target = toNumber(goal.targetAmount);
            const current = toNumber(goal.currentAmount);
            const progress =
              target > 0 ? Math.min(100, (current / target) * 100) : 0;
            return (
              <tr key={goal.uuid} className="border-b last:border-0">
                <td className="p-3 font-medium">{goal.title}</td>
                <td className="p-3 text-right tabular-nums">
                  <span className="text-muted-foreground">
                    {formatCurrency(current)} / {formatCurrency(target)}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({progress.toFixed(0)}%)
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {goal.deadline ? formatDate(goal.deadline) : "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(goal)}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(goal)}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
