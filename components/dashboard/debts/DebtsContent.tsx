"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { DebtFormDialog } from "@/components/dashboard/debts/DebtFormDialog";
import { DebtList } from "@/components/dashboard/debts/DebtList";
import { DebtPaymentDialog } from "@/components/dashboard/debts/DebtPaymentDialog";
import { Pagination } from "@/components/ui/pagination";
import type { Asset, Debt, ListMeta } from "@/lib/api/types";
import type {
  CreateDebtFormValues,
  UpdateDebtFormValues,
  CreateDebtPaymentFormValues,
} from "@/lib/validations/debt";
import { Plus } from "lucide-react";

export interface DebtsContentProps {
  debts: Debt[];
  meta: ListMeta | undefined;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingDebt: Debt | null;
  debtToDelete: Debt | null;
  deleteDialogOpen: boolean;
  debtForPayment: Debt | null;
  paymentDialogOpen: boolean;
  assets?: Asset[];
  onAddClick: () => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onDialogOpenChange: (open: boolean) => void;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onPaymentDialogOpenChange: (open: boolean) => void;
  onCreate: (data: CreateDebtFormValues) => Promise<void>;
  onEditSubmit: (data: UpdateDebtFormValues) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  onPaymentSubmit: (data: CreateDebtPaymentFormValues) => Promise<void>;
  onRecordPayment: (debt: Debt) => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  isRecordingPayment: boolean;
}

export function DebtsContent({
  debts,
  meta,
  page,
  setPage,
  limit,
  isLoading,
  isError,
  error,
  dialogOpen,
  dialogMode,
  editingDebt,
  debtToDelete,
  deleteDialogOpen,
  debtForPayment,
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
}: DebtsContentProps) {
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total;
  const showPagination = !!meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Debts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track what you owe and record payments.
          </p>
        </div>
        <Button onClick={onAddClick}>
          <Plus className="size-4" />
          Add debt
        </Button>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message ?? "Failed to load debts."}
        </p>
      )}

      <DebtList
        debts={debts}
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

      <DebtFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        mode={dialogMode}
        debt={editingDebt}
        assets={assets}
        onSubmitCreate={onCreate}
        onSubmitEdit={onEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title="Delete debt?"
        description="This action cannot be undone."
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />

      <DebtPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={onPaymentDialogOpenChange}
        debt={debtForPayment}
        assets={assets}
        onSubmit={onPaymentSubmit}
        isSubmitting={isRecordingPayment}
      />
    </div>
  );
}
