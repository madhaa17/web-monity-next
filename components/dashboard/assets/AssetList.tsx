"use client";

import Link from "next/link";
import type { Asset } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  STOCK: "Stock",
  LIVESTOCK: "Livestock",
  REAL_ESTATE: "Real estate",
  OTHER: "Other",
};

export interface AssetListProps {
  assets: Asset[];
  isLoading?: boolean;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function AssetList({
  assets,
  isLoading,
  onEdit,
  onDelete,
}: AssetListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Type</th>
              <th className="p-3 text-right font-medium">Quantity</th>
              <th className="p-3 text-right font-medium">Cost</th>
              <th className="w-[140px] p-3 font-medium">Actions</th>
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

  if (assets.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
        No assets yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">Name</th>
            <th className="p-3 text-left font-medium">Type</th>
            <th className="p-3 text-right font-medium">Quantity</th>
            <th className="p-3 text-right font-medium">Cost</th>
            <th className="w-[140px] p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const quantity = toNumber(asset.quantity);
            const totalCost = toNumber(asset.totalCost);
            const currency = (asset.purchaseCurrency as string) ?? "IDR";
            return (
              <tr key={asset.uuid} className="border-b last:border-0">
                <td className="p-3 font-medium">{asset.name}</td>
                <td className="p-3">{TYPE_LABELS[asset.type] ?? asset.type}</td>
                <td className="p-3 text-right tabular-nums">
                  {quantity.toLocaleString("id-ID")}
                </td>
                <td className="p-3 text-right tabular-nums">
                  {formatCurrency(totalCost, currency)}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
