"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Income } from "@/lib/api/types";
import type { Asset } from "@/lib/api/types";
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
import { Banknote, Pencil, Trash2 } from "lucide-react";

const columnHelper = createColumnHelper<Income>();

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
  const columns = [
    columnHelper.accessor("date", {
      header: "Date",
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor("source", {
      header: "Source",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    columnHelper.accessor("note", {
      header: "Note",
      cell: ({ getValue }) => (getValue() as string) ?? "—",
    }),
    columnHelper.accessor("amount", {
      header: () => <span className="text-right">Amount</span>,
      cell: ({ getValue }) => (
        <span className="tabular-nums text-green-600 dark:text-green-500">
          {formatCurrency(toNumber(getValue()))}
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
    data: incomes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">Date</TableHead>
              <TableHead className="p-3">Source</TableHead>
              <TableHead className="p-3">Note</TableHead>
              <TableHead className="p-3 text-right">Amount</TableHead>
              <TableHead className="w-[120px] p-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={5} className="h-12 animate-pulse bg-muted/30 p-3" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="rounded-md border">
        <Empty>
          <EmptyMedia variant="icon">
            <Banknote />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No incomes yet</EmptyTitle>
            <EmptyDescription>Add one to get started.</EmptyDescription>
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
