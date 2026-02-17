"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Debt } from "@/lib/api/types";
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
import { HandCoins, Pencil, Plus, Trash2 } from "lucide-react";

const columnHelper = createColumnHelper<Debt>();

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PARTIAL: "border border-input bg-background",
  PAID: "bg-primary/10 text-primary",
  OVERDUE: "bg-destructive/10 text-destructive",
};

export interface DebtListProps {
  debts: Debt[];
  isLoading?: boolean;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onRecordPayment?: (debt: Debt) => void;
}

export function DebtList({
  debts,
  isLoading,
  onEdit,
  onDelete,
  onRecordPayment,
}: DebtListProps) {
  const columns = [
    columnHelper.accessor("partyName", {
      header: "Party",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() ?? "—"}</span>
      ),
    }),
    columnHelper.accessor("amount", {
      header: () => <span className="text-right">Amount</span>,
      cell: ({ getValue }) => (
        <span className="tabular-nums text-right">
          {formatCurrency(toNumber(getValue()))}
        </span>
      ),
    }),
    columnHelper.accessor("paidAmount", {
      header: () => <span className="text-right">Paid</span>,
      cell: ({ getValue }) => (
        <span className="tabular-nums text-right text-muted-foreground">
          {formatCurrency(toNumber(getValue()))}
        </span>
      ),
    }),
    columnHelper.accessor("dueDate", {
      header: "Due date",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {getValue() ? formatDate(getValue() as string) : "—"}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const status = (getValue() ?? "PENDING") as string;
        return (
          <span
            className={
              "inline-flex rounded-md px-2 py-0.5 text-xs font-medium " +
              (STATUS_CLASSES[status] ?? STATUS_CLASSES.PENDING)
            }
          >
            {status}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="w-[140px]" />,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {onRecordPayment && row.original.status !== "PAID" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onRecordPayment(row.original)}
              aria-label="Record payment"
            >
              <Plus className="size-4" />
            </Button>
          )}
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
    data: debts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">Party</TableHead>
              <TableHead className="p-3 text-right">Amount</TableHead>
              <TableHead className="p-3 text-right">Paid</TableHead>
              <TableHead className="p-3">Due date</TableHead>
              <TableHead className="p-3">Status</TableHead>
              <TableHead className="w-[140px] p-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell
                  colSpan={6}
                  className="h-12 animate-pulse bg-muted/30 p-3"
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="rounded-md border">
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HandCoins />
            </EmptyMedia>
            <EmptyTitle>No debts yet</EmptyTitle>
            <EmptyDescription>
              Add a debt to track what you owe.
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
