"use client";

import type { Category, Income, TransactionKind } from "@/lib/api/types";
import type { Transaction } from "@/lib/api/transactions";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryLabel } from "@/components/dashboard/transactions/CategorySelect";
import { Pencil, Receipt, SearchX, Trash2, Wallet } from "lucide-react";

export interface TransactionListProps<K extends TransactionKind> {
  kind: K;
  items: Transaction<K>[];
  categories: Category[];
  isLoading?: boolean;
  isFiltered: boolean;
  onClearFilters: () => void;
  onEdit: (item: Transaction<K>) => void;
  onDelete: (item: Transaction<K>) => void;
}

const COLUMN_COUNT = 6;

export function TransactionList<K extends TransactionKind>({
  kind,
  items,
  categories,
  isLoading,
  isFiltered,
  onClearFilters,
  onEdit,
  onDelete,
}: TransactionListProps<K>) {
  const isIncome = kind === "income";
  const colorByUuid = new Map(categories.map((c) => [c.uuid, c.color]));

  if (!isLoading && items.length === 0) {
    return (
      <div className="rounded-md border">
        {isFiltered ? (
          <Empty>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No matching {isIncome ? "incomes" : "expenses"}</EmptyTitle>
              <EmptyDescription>Try a different period, category or search.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          </Empty>
        ) : (
          <Empty>
            <EmptyMedia variant="icon">{isIncome ? <Wallet /> : <Receipt />}</EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No {isIncome ? "incomes" : "expenses"} yet</EmptyTitle>
              <EmptyDescription>Add one to get started.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-3">Date</TableHead>
            <TableHead className="p-3">{isIncome ? "Source" : "Note"}</TableHead>
            <TableHead className="p-3">Category</TableHead>
            <TableHead className="p-3">{isIncome ? "Deposited to" : "Paid from"}</TableHead>
            <TableHead className="p-3 text-right">Amount</TableHead>
            <TableHead className="w-[88px] p-3">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={COLUMN_COUNT} className="bg-muted/30 h-12 animate-pulse p-3" />
                </TableRow>
              ))
            : items.map((item) => {
                const title = isIncome ? (item as Income).source : item.note;
                const subtitle = isIncome ? item.note : undefined;
                return (
                  <TableRow key={item.uuid}>
                    <TableCell className="p-3 whitespace-nowrap">{formatDate(item.date)}</TableCell>
                    <TableCell className="max-w-[240px] p-3">
                      <div className="truncate">{title || "—"}</div>
                      {subtitle && <div className="text-muted-foreground truncate text-xs">{subtitle}</div>}
                    </TableCell>
                    <TableCell className="p-3">
                      <CategoryLabel
                        uuid={item.categoryUuid}
                        name={item.category}
                        color={colorByUuid.get(item.categoryUuid)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground p-3">{item.assetName || "—"}</TableCell>
                    <TableCell className="p-3 text-right">
                      <span
                        className={
                          isIncome
                            ? "tabular-nums text-green-600 dark:text-green-500"
                            : "tabular-nums text-red-600 dark:text-red-500"
                        }
                      >
                        {isIncome ? "+" : "−"}
                        {formatCurrency(toNumber(item.amount))}
                      </span>
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(item)}
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8"
                          onClick={() => onDelete(item)}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}
