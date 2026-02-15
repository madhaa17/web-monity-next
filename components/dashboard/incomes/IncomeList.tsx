"use client";

import type { Income } from "@/lib/api/types";
import type { Asset } from "@/lib/api/types";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export interface IncomeListProps {
  incomes: Income[];
  assets: Asset[];
  isLoading?: boolean;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}

export function IncomeList({
  incomes,
  assets,
  isLoading,
  onEdit,
  onDelete,
}: IncomeListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Source</th>
              <th className="p-3 text-left font-medium">Note</th>
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

  if (incomes.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
        No incomes yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Source</th>
            <th className="p-3 text-left font-medium">Note</th>
            <th className="p-3 text-right font-medium">Amount</th>
            <th className="w-[120px] p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((inc) => {
            const amount = toNumber(inc.amount);
            return (
              <tr key={inc.uuid} className="border-b last:border-0">
                <td className="p-3">{formatDate(inc.date)}</td>
                <td className="p-3">{(inc.source as string) ?? "—"}</td>
                <td className="p-3">{(inc.note as string) ?? "—"}</td>
                <td className="p-3 text-right tabular-nums text-green-600 dark:text-green-500">
                  {formatCurrency(amount)}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(inc)}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(inc)}
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
