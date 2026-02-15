"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Target, Trash2 } from "lucide-react";

const columnHelper = createColumnHelper<SavingGoal>();

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
  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() ?? "—"}</span>
      ),
    }),
    columnHelper.display({
      id: "progress",
      header: () => <span className="text-right">Progress</span>,
      cell: ({ row }) => {
        const goal = row.original;
        const target = toNumber(goal.targetAmount);
        const current = toNumber(goal.currentAmount);
        const progress =
          target > 0 ? Math.min(100, (current / target) * 100) : 0;
        return (
          <span className="tabular-nums text-right text-muted-foreground">
            {formatCurrency(current)} / {formatCurrency(target)}
            <span className="ml-2 text-xs">({progress.toFixed(0)}%)</span>
          </span>
        );
      },
    }),
    columnHelper.accessor("deadline", {
      header: "Deadline",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {getValue() ? formatDate(getValue() as string) : "—"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="w-[120px]" />,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(row.original)}
            aria-label="Edit"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: goals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">Title</TableHead>
              <TableHead className="p-3 text-right">Progress</TableHead>
              <TableHead className="p-3">Deadline</TableHead>
              <TableHead className="w-[120px] p-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell
                  colSpan={4}
                  className="h-12 animate-pulse bg-muted/30 p-3"
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-md border">
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
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="p-3">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="p-3">
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
