"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import type { Asset } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
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
import { Eye, Pencil, Trash2, Wallet } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  STOCK: "Stock",
  LIVESTOCK: "Livestock",
  REAL_ESTATE: "Real estate",
  OTHER: "Other",
};

const columnHelper = createColumnHelper<Asset>();

export interface AssetListProps {
  assets: Asset[];
  isLoading?: boolean;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  /** For non-CRYPTO/STOCK assets: open detail in dialog instead of navigating. */
  onViewDetail?: (asset: Asset) => void;
}

export function AssetList({
  assets,
  isLoading,
  onEdit,
  onDelete,
  onViewDetail,
}: AssetListProps) {
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() ?? "—"}</span>
      ),
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ getValue }) =>
        TYPE_LABELS[(getValue() as string) ?? ""] ?? (getValue() as string),
    }),
    columnHelper.display({
      id: "quantityAmount",
      header: () => (
        <span className="text-right">Quantity / Amount</span>
      ),
      cell: ({ row }) => {
        const asset = row.original;
        const quantity = toNumber(asset.quantity);
        const currency = (asset.purchaseCurrency as string) ?? "IDR";
        const isCash = asset.type === "CASH";
        return (
          <span className="tabular-nums text-right">
            {isCash
              ? formatCurrency(quantity, currency)
              : quantity.toLocaleString("id-ID")}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "cost",
      header: () => <span className="text-right">Cost</span>,
      cell: ({ row }) => {
        const asset = row.original;
        const totalCost = toNumber(asset.totalCost);
        const currency = (asset.purchaseCurrency as string) ?? "IDR";
        const isCash = asset.type === "CASH";
        return (
          <span className="tabular-nums text-right">
            {isCash ? "—" : formatCurrency(totalCost, currency)}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="w-[140px]" />,
      cell: ({ row }) => {
        const asset = row.original;
        const isDetailPage = asset.type === "CRYPTO" || asset.type === "STOCK";
        return (
          <div className="flex gap-1">
            {isDetailPage ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
                aria-label="View detail"
              >
                <Link href={`/dashboard/assets/${asset.uuid}`}>
                  <Eye className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewDetail?.(asset)}
                aria-label="View detail"
              >
                <Eye className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(asset)}
              aria-label="Edit"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(asset)}
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: assets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">Name</TableHead>
              <TableHead className="p-3">Type</TableHead>
              <TableHead className="p-3 text-right">
                Quantity / Amount
              </TableHead>
              <TableHead className="p-3 text-right">Cost</TableHead>
              <TableHead className="w-[140px] p-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell
                  colSpan={5}
                  className="h-12 animate-pulse bg-muted/30 p-3"
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-md border">
        <Empty>
          <EmptyMedia variant="icon">
            <Wallet />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No assets yet</EmptyTitle>
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
