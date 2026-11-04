"use client";

import type { Obligation, ObligationKind, ObligationStatus } from "@/lib/api/obligations";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, HandCoins, History, Pencil, Plus, Trash2 } from "lucide-react";
import { OBLIGATION_COPY } from "@/components/dashboard/obligations/copy";

export const STATUS_LABEL: Record<ObligationStatus, string> = {
  PENDING: "Unpaid",
  PARTIAL: "Partly paid",
  PAID: "Paid off",
  OVERDUE: "Overdue",
};

const STATUS_CLASS: Record<ObligationStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PARTIAL: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PAID: "bg-green-600/10 text-green-700 dark:text-green-400",
  OVERDUE: "bg-destructive/10 text-destructive",
};

export interface ObligationListProps {
  kind: ObligationKind;
  items: Obligation[];
  isLoading: boolean;
  onPay: (item: Obligation) => void;
  onHistory: (item: Obligation) => void;
  onEdit: (item: Obligation) => void;
  onDelete: (item: Obligation) => void;
}

export function ObligationList({ kind, items, isLoading, onPay, onHistory, onEdit, onDelete }: ObligationListProps) {
  const copy = OBLIGATION_COPY[kind];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[92px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border">
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">{kind === "debt" ? <HandCoins /> : <ArrowRightLeft />}</EmptyMedia>
            <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
            <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-xl border">
      {items.map((item) => {
        const amount = toNumber(item.amount);
        const paid = toNumber(item.paidAmount);
        const remaining = Math.max(amount - paid, 0);
        const progress = amount > 0 ? Math.min((paid / amount) * 100, 100) : 0;
        const isPaid = item.status === "PAID";
        return (
          <li key={item.uuid} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium">{item.partyName}</span>
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_CLASS[item.status])}>
                  {STATUS_LABEL[item.status]}
                </span>
              </div>
              <div
                className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${copy.paid} ${Math.round(progress)}%`}
              >
                <div
                  className={cn("h-full rounded-full", isPaid ? "bg-green-600" : "bg-primary")}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                <span className="tabular-nums">
                  {copy.paid} {formatCurrency(paid)} of {formatCurrency(amount)}
                </span>
                {item.dueDate && (
                  <span className={cn(item.status === "OVERDUE" && "text-destructive")}>
                    {" "}
                    · due {formatDate(item.dueDate)}
                  </span>
                )}
                {item.asset && <span> · {item.asset.name}</span>}
                {item.note && <span> · {item.note}</span>}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="text-left sm:text-right">
                <p className="text-muted-foreground text-xs">Remaining</p>
                <p className="font-semibold tabular-nums">{formatCurrency(remaining)}</p>
              </div>
              <div className="flex gap-1">
                {!isPaid && (
                  <Button size="sm" variant="outline" onClick={() => onPay(item)}>
                    <Plus className="size-4" />
                    Repay
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onHistory(item)}
                  aria-label="Repayment history"
                >
                  <History className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(item)} aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => onDelete(item)}
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
