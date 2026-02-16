"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ExpenseFormDialog } from "@/components/dashboard/expenses/ExpenseFormDialog";
import { ExpenseList } from "@/components/dashboard/expenses/ExpenseList";
import type { Asset, Expense } from "@/lib/api/types";
import type { CreateExpenseFormValues, UpdateExpenseFormValues } from "@/lib/validations/expense";
import { Plus } from "lucide-react";

export interface ExpensesContentProps {
  expenses: Expense[];
  assets: Asset[];
  cashAssets: Asset[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingExpense: Expense | null;
  expenseToDelete: Expense | null;
  deleteDialogOpen: boolean;
  onAddClick: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onDialogOpenChange: (open: boolean) => void;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onCreate: (data: CreateExpenseFormValues) => Promise<void>;
  onEditSubmit: (data: UpdateExpenseFormValues) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  isSubmitting: boolean;
  isDeleting: boolean;
}

export function ExpensesContent({
  expenses,
  assets,
  cashAssets,
  isLoading,
  isError,
  error,
  dialogOpen,
  dialogMode,
  editingExpense,
  expenseToDelete,
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
}: ExpensesContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record and manage your spending by category.
          </p>
        </div>
        <Button onClick={onAddClick} disabled={cashAssets.length === 0}>
          <Plus className="size-4" />
          Add expense
        </Button>
      </div>

      {cashAssets.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a CASH asset first to record expenses.
        </p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message ?? "Failed to load expenses."}
        </p>
      )}

      <ExpenseList
        expenses={expenses}
        assets={assets}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        mode={dialogMode}
        expense={editingExpense}
        cashAssets={cashAssets}
        onSubmitCreate={onCreate}
        onSubmitEdit={onEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title="Delete expense?"
        description="This action cannot be undone."
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
