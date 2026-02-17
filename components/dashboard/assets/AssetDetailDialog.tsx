"use client";

import type { Asset } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TYPE_LABELS: Record<string, string> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  STOCK: "Stock",
  LIVESTOCK: "Livestock",
  REAL_ESTATE: "Real estate",
  OTHER: "Other",
};

export interface AssetDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

export function AssetDetailDialog({
  open,
  onOpenChange,
  asset,
}: AssetDetailDialogProps) {
  if (!asset) return null;

  const currency = (asset.purchaseCurrency as string)?.trim() ?? "IDR";
  const quantity = toNumber(asset.quantity);
  const totalCost = toNumber(asset.totalCost);
  const isCash = asset.type === "CASH";
  const notes = (asset.notes as string)?.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{asset.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{TYPE_LABELS[asset.type] ?? asset.type}</span>
          </div>
          {isCash ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="tabular-nums">
                {formatCurrency(quantity, currency)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="tabular-nums">
                  {quantity.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost</span>
                <span className="tabular-nums">
                  {formatCurrency(totalCost, currency)}
                </span>
              </div>
            </>
          )}
          {notes ? (
            <div className="pt-2 border-t border-border/50">
              <span className="text-muted-foreground block mb-1">Notes</span>
              <p className="text-foreground">{notes}</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
