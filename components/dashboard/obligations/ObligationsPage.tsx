"use client";

import { useState } from "react";
import type { Obligation, ObligationKind, ObligationStatus } from "@/lib/api/obligations";
import { useObligationsData } from "@/hooks/useObligationsData";
import { formatCurrency, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { OBLIGATION_COPY } from "@/components/dashboard/obligations/copy";
import { ObligationList, STATUS_LABEL } from "@/components/dashboard/obligations/ObligationList";
import { ObligationFormDialog } from "@/components/dashboard/obligations/ObligationFormDialog";
import { PaymentDialog } from "@/components/dashboard/obligations/PaymentDialog";
import { PaymentHistoryDialog } from "@/components/dashboard/obligations/PaymentHistoryDialog";

const FILTERS: (ObligationStatus | undefined)[] = [undefined, "PENDING", "PARTIAL", "OVERDUE", "PAID"];

/** The debts and receivables pages: totals, status filter, list, and the add/edit/repay dialogs. */
export function ObligationsPage({ kind }: { kind: ObligationKind }) {
  const data = useObligationsData(kind);
  const copy = OBLIGATION_COPY[kind];

  // null = closed; { item: null } = creating; { item } = editing that item.
  const [form, setForm] = useState<{ item: Obligation | null } | null>(null);
  const [paying, setPaying] = useState<Obligation | null>(null);
  const [history, setHistory] = useState<Obligation | null>(null);
  const [toDelete, setToDelete] = useState<Obligation | null>(null);

  const overdue = data.overdueCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{copy.subtitle}</p>
        </div>
        <Button onClick={() => setForm({ item: null })}>
          <Plus className="size-4" />
          {copy.add}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm">{copy.outstanding}</p>
            {data.isSummaryLoading ? (
              <Skeleton className="mt-1 h-8 w-40" />
            ) : (
              <p className="text-2xl font-semibold tabular-nums">{formatCurrency(toNumber(data.outstanding))}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm">Overdue</p>
            {data.isSummaryLoading ? (
              <Skeleton className="mt-1 h-8 w-16" />
            ) : (
              <p className={cn("text-2xl font-semibold tabular-nums", overdue > 0 && "text-destructive")}>
                {overdue}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((s) => (
          <Button
            key={s ?? "ALL"}
            size="sm"
            variant={data.status === s ? "secondary" : "ghost"}
            aria-pressed={data.status === s}
            onClick={() => data.setStatus(s)}
          >
            {s ? STATUS_LABEL[s] : "All"}
          </Button>
        ))}
      </div>

      {data.error && <p className="text-destructive text-sm">{data.error.message}</p>}

      <ObligationList
        kind={kind}
        items={data.items}
        isLoading={data.isLoading}
        onPay={setPaying}
        onHistory={setHistory}
        onEdit={(item) => setForm({ item })}
        onDelete={setToDelete}
      />

      {data.meta && (data.meta.totalPages ?? 1) > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.meta.totalPages ?? 1}
          total={data.meta.total}
          limit={data.meta.limit}
          onPageChange={data.setPage}
          disabled={data.isLoading}
        />
      )}

      <ObligationFormDialog
        kind={kind}
        open={form !== null}
        onOpenChange={(open) => !open && setForm(null)}
        item={form?.item ?? null}
        cashAssets={data.cashAssets}
        onCreate={(body) => data.createMutation.mutateAsync(body)}
        onUpdate={(uuid, body) => data.updateMutation.mutateAsync({ uuid, body })}
        isSubmitting={data.createMutation.isPending || data.updateMutation.isPending}
      />

      <PaymentDialog
        kind={kind}
        open={paying !== null}
        onOpenChange={(open) => !open && setPaying(null)}
        item={paying}
        cashAssets={data.cashAssets}
        onSubmit={(uuid, body) => data.paymentMutation.mutateAsync({ uuid, body })}
        isSubmitting={data.paymentMutation.isPending}
      />

      <PaymentHistoryDialog
        kind={kind}
        open={history !== null}
        onOpenChange={(open) => !open && setHistory(null)}
        // Read the fresh row so totals update after a repayment is removed.
        item={data.items.find((i) => i.uuid === history?.uuid) ?? history}
        onDeletePayment={(uuid, paymentUuid) => data.deletePaymentMutation.mutateAsync({ uuid, paymentUuid })}
        isDeleting={data.deletePaymentMutation.isPending}
      />

      <DeleteConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${copy.noun}${toDelete ? ` with ${toDelete.partyName}` : ""}?`}
        description={copy.deleteDescription}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await data.deleteMutation.mutateAsync(toDelete.uuid);
            setToDelete(null);
          } catch {
            // Shown as a toast; keep the dialog open.
          }
        }}
        isDeleting={data.deleteMutation.isPending}
      />
    </div>
  );
}
