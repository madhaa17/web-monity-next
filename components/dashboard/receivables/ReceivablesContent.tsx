"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ReceivableFormDialog } from "@/components/dashboard/receivables/ReceivableFormDialog";
import { ReceivableList } from "@/components/dashboard/receivables/ReceivableList";
import { ReceivablePaymentDialog } from "@/components/dashboard/receivables/ReceivablePaymentDialog";
import { Pagination } from "@/components/ui/pagination";
import type { Asset, ListMeta, Receivable } from "@/lib/api/types";
import type {
  CreateReceivableFormValues,
  UpdateReceivableFormValues,
  CreateReceivablePaymentFormValues,
} from "@/lib/validations/receivable";
import { Plus } from "lucide-react";

export interface ReceivablesContentProps {
  receivables: Receivable[];
  meta: ListMeta | undefined;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingReceivable: Receivable | null;
  receivableToDelete: Receivable | null;
  deleteDialogOpen: boolean;
  receivableForPayment: Receivable | null;
  paymentDialogOpen: boolean;
  assets?: Asset[];
  onAddClick: () => void;
  onEdit: (receivable: Receivable) => void;
  onDelete: (receivable: Receivable) => void;
  onDialogOpenChange: (open: boolean) => void;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onPaymentDialogOpenChange: (open: boolean) => void;
  onCreate: (data: CreateReceivableFormValues) => Promise<void>;
  onEditSubmit: (data: UpdateReceivableFormValues) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  onPaymentSubmit: (data: CreateReceivablePaymentFormValues) => Promise<void>;
  onRecordPayment: (receivable: Receivable) => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  isRecordingPayment: boolean;
}

export function ReceivablesContent({
  receivables,
  meta,
  page,
  setPage,
  limit,
  isLoading,
  isError,
  error,
  dialogOpen,
  dialogMode,
  editingReceivable,
  receivableToDelete,
  deleteDialogOpen,
  receivableForPayment,
  paymentDialogOpen,
  assets = [],
  onAddClick,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onDeleteDialogOpenChange,
  onPaymentDialogOpenChange,
  onCreate,
  onEditSubmit,
  onConfirmDelete,
  onPaymentSubmit,
  onRecordPayment,
  isSubmitting,
  isDeleting,
  isRecordingPayment,
}: ReceivablesContentProps) {
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total;
  const showPagination = !!meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Receivables</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track what others owe you and record payments.
          </p>
        </div>
        <Button onClick={onAddClick}>
          <Plus className="size-4" />
          Add receivable
        </Button>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message ?? "Failed to load receivables."}
        </p>
      )}

      <ReceivableList
        receivables={receivables}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onRecordPayment={onRecordPayment}
      />

      {showPagination && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          disabled={isLoading}
        />
      )}

      <ReceivableFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        mode={dialogMode}
        receivable={editingReceivable}
        assets={assets}
        onSubmitCreate={onCreate}
        onSubmitEdit={onEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title="Delete receivable?"
        description="This action cannot be undone."
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />

      <ReceivablePaymentDialog
        open={paymentDialogOpen}
        onOpenChange={onPaymentDialogOpenChange}
        receivable={receivableForPayment}
        assets={assets}
        onSubmit={onPaymentSubmit}
        isSubmitting={isRecordingPayment}
      />
    </div>
  );
}
