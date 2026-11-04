"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Obligation, ObligationKind } from "@/lib/api/obligations";
import { obligationPaymentsQueryOptions } from "@/lib/queries/obligations";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { OBLIGATION_COPY } from "@/components/dashboard/obligations/copy";

export interface PaymentHistoryDialogProps {
  kind: ObligationKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Obligation | null;
  onDeletePayment: (uuid: string, paymentUuid: string) => Promise<unknown>;
  isDeleting?: boolean;
}

export function PaymentHistoryDialog({
  kind,
  open,
  onOpenChange,
  item,
  onDeletePayment,
  isDeleting = false,
}: PaymentHistoryDialogProps) {
  const copy = OBLIGATION_COPY[kind];
  const [confirming, setConfirming] = useState<string | null>(null);
  const payments = useQuery({
    ...obligationPaymentsQueryOptions(kind, item?.uuid ?? ""),
    enabled: open && !!item,
  });

  const remove = async (paymentUuid: string) => {
    if (!item) return;
    try {
      await onDeletePayment(item.uuid, paymentUuid);
    } catch {
      // Shown as a toast.
    }
    setConfirming(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirming(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Repayments{item ? ` · ${item.partyName}` : ""}</DialogTitle>
          {item && (
            <DialogDescription>
              {copy.paid} {formatCurrency(toNumber(item.paidAmount))} of {formatCurrency(toNumber(item.amount))}.
              Removing a repayment reverses its cash movement.
            </DialogDescription>
          )}
        </DialogHeader>
        {payments.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : payments.error ? (
          <p className="text-destructive text-sm">{payments.error.message}</p>
        ) : (payments.data ?? []).length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No repayments recorded yet.</p>
        ) : (
          <ul className="max-h-[50vh] divide-y overflow-y-auto rounded-md border">
            {(payments.data ?? []).map((p) => (
              <li key={p.uuid} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium tabular-nums">{formatCurrency(toNumber(p.amount))}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {formatDate(p.date)}
                    {p.asset ? ` · ${p.asset.name}` : " · no cash movement"}
                    {p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
                {confirming === p.uuid ? (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(null)} disabled={isDeleting}>
                      Cancel
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(p.uuid)} disabled={isDeleting}>
                      {isDeleting ? "Removing…" : "Remove"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => setConfirming(p.uuid)}
                    aria-label="Remove repayment"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
