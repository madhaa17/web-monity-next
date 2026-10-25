"use client";

import type { TransactionKind, TransactionSummary } from "@/lib/api/types";
import { categoryColor } from "@/lib/category-color";
import { formatCurrency, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDot } from "@/components/dashboard/transactions/CategorySelect";

const MAX_LEGEND_ITEMS = 6;

export interface TransactionSummaryCardProps {
  kind: TransactionKind;
  summary: TransactionSummary | undefined;
  isLoading: boolean;
  /** Narrows the list to one category when a breakdown row is clicked. */
  onCategoryClick: (categoryUuid: string) => void;
  activeCategory?: string;
}

/** Totals and per-category breakdown for whatever the list is currently filtered to. */
export function TransactionSummaryCard({
  kind,
  summary,
  isLoading,
  onCategoryClick,
  activeCategory,
}: TransactionSummaryCardProps) {
  if (isLoading || !summary) {
    return <Skeleton className="h-[148px] w-full rounded-xl" />;
  }

  const total = toNumber(summary.total);
  const categories = summary.byCategory ?? [];
  const legend = categories.slice(0, MAX_LEGEND_ITEMS);
  const amountClass =
    kind === "income" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500";

  return (
    <Card>
      <CardContent className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <dl className="grid grid-cols-3 gap-4 md:grid-cols-1 md:gap-3">
          <div className="col-span-3 md:col-span-1">
            <dt className="text-muted-foreground text-sm">Total {kind === "income" ? "income" : "spent"}</dt>
            <dd className={cn("text-2xl font-semibold tabular-nums", amountClass)}>{formatCurrency(total)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Transactions</dt>
            <dd className="font-medium tabular-nums">{summary.count}</dd>
          </div>
          <div className="col-span-2 md:col-span-1">
            <dt className="text-muted-foreground text-xs">Average</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(toNumber(summary.average))}</dd>
          </div>
        </dl>

        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-muted-foreground text-sm">By category</p>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nothing recorded for this filter.</p>
          ) : (
            <>
              <div className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full" aria-hidden>
                {categories.map((c) => (
                  <div
                    key={c.categoryUuid ?? c.category}
                    style={{
                      width: `${c.percentage ?? 0}%`,
                      backgroundColor: categoryColor({ color: c.color, uuid: c.categoryUuid, name: c.category }),
                    }}
                  />
                ))}
              </div>
              <ul className="grid gap-1 sm:grid-cols-2">
                {legend.map((c) => {
                  const uuid = c.categoryUuid ?? "";
                  const isActive = activeCategory === uuid;
                  return (
                    <li key={uuid || c.category}>
                      <button
                        type="button"
                        onClick={() => onCategoryClick(isActive ? "" : uuid)}
                        className={cn(
                          "hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm",
                          isActive && "bg-accent"
                        )}
                        aria-pressed={isActive}
                        title={isActive ? "Show all categories" : `Show only ${c.category}`}
                      >
                        <CategoryDot category={{ color: c.color, uuid: c.categoryUuid, name: c.category }} />
                        <span className="min-w-0 flex-1 truncate">{c.category}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {Math.round(c.percentage ?? 0)}%
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {categories.length > legend.length && (
                <p className="text-muted-foreground text-xs">
                  +{categories.length - legend.length} more categories
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
