"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IncomeFormDialog } from "@/components/dashboard/incomes/IncomeFormDialog";
import { IncomeList } from "@/components/dashboard/incomes/IncomeList";
import type { Asset, Income } from "@/lib/api/types";
import type { CreateIncomeFormValues, UpdateIncomeFormValues } from "@/lib/validations/income";
import { Plus } from "lucide-react";

export interface IncomesContentProps {
  incomes: Income[];
  assets: Asset[];
  cashAssets: Asset[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingIncome: Income | null;
  incomeToDelete: Income | null;
  deleteDialogOpen: boolean;
  onAddClick: () => void;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
  onDialogOpenChange: (open: boolean) => void;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onCreate: (data: CreateIncomeFormValues) => Promise<void>;
  onEditSubmit: (data: UpdateIncomeFormValues) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  isSubmitting: boolean;
  isDeleting: boolean;
}

export function IncomesContent({
  incomes,
  assets,
  cashAssets,
  isLoading,
  isError,
  error,
  dialogOpen,
  dialogMode,
  editingIncome,
  incomeToDelete,
  deleteDialogOpen,
  onAddClick,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onDeleteDialogOpenChange,
  onCreate,
  onEditSubmit,
  onConfirmDelete,
  isSubmitting,
  isDeleting,
}: IncomesContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Incomes</h1>
        <Button onClick={onAddClick} disabled={cashAssets.length === 0}>
          <Plus className="size-4" />
          Add income
        </Button>
      </div>

      {cashAssets.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a CASH asset first to record incomes.
        </p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message ?? "Failed to load incomes."}
        </p>
      )}

      <IncomeList
        incomes={incomes}
        assets={assets}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <IncomeFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        mode={dialogMode}
        income={editingIncome}
        cashAssets={cashAssets}
        onSubmitCreate={onCreate}
        onSubmitEdit={onEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title="Delete income?"
        description="This action cannot be undone."
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
