"use client";

import type { Expense } from "@/lib/api/types";
import type { Asset } from "@/lib/api/types";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Food",
  TRANSPORT: "Transport",
  HOUSING: "Housing",
  UTILITIES: "Utilities",
  HEALTH: "Health",
  ENTERTAINMENT: "Entertainment",
  SHOPPING: "Shopping",
  OTHER: "Other",
};

export interface ExpenseListProps {
  expenses: Expense[];
  assets: Asset[];
  isLoading?: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseList({
  expenses,
  assets,
  isLoading,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Note</th>
              <th className="p-3 text-left font-medium">Category</th>
              <th className="p-3 text-right font-medium">Amount</th>
              <th className="w-[120px] p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b">
                <td colSpan={5} className="h-12 animate-pulse bg-muted/30 p-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
        No expenses yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Note</th>
            <th className="p-3 text-left font-medium">Category</th>
            <th className="p-3 text-right font-medium">Amount</th>
            <th className="w-[120px] p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => {
            const amount = toNumber(exp.amount);
            const category = (exp.category as string) ?? "OTHER";
            return (
              <tr key={exp.uuid} className="border-b last:border-0">
                <td className="p-3">{formatDate(exp.date)}</td>
                <td className="p-3">{(exp.note as string) ?? "—"}</td>
                <td className="p-3">{CATEGORY_LABELS[category] ?? category}</td>
                <td className="p-3 text-right tabular-nums text-red-600 dark:text-red-500">
                  {formatCurrency(amount)}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(exp)}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(exp)}
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
