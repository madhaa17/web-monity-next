"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ExpenseFormDialog } from "@/components/dashboard/expenses/ExpenseFormDialog";
import { ExpenseList } from "@/components/dashboard/expenses/ExpenseList";
import { createExpense, deleteExpense, updateExpense } from "@/lib/api/expenses";
import { expensesQueryKey } from "@/lib/queries/expenses";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { expensesQueryOptions } from "@/lib/queries/expenses";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Expense } from "@/lib/api/types";
import type { CreateExpenseFormValues, UpdateExpenseFormValues } from "@/lib/validations/expense";
import { Plus } from "lucide-react";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: expenses = [], isLoading, isError, error } = useQuery(expensesQueryOptions());
  const { data: assets = [] } = useQuery(assetsQueryOptions());
  const cashAssets = assets.filter((a) => a.type === "CASH");

  const createMutation = useMutation({
    mutationFn: (body: CreateExpenseFormValues) =>
      createExpense({
        assetUuid: body.assetUuid,
        amount: body.amount,
        category: body.category,
        note: body.note,
        date: body.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      toast.success("Expense added");
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateExpenseFormValues }) =>
      updateExpense(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      toast.success("Expense updated");
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteExpense(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      toast.success("Expense deleted");
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete expense");
    },
  });

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    await deleteMutation.mutateAsync(expenseToDelete.uuid);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingExpense(null);
  };

  const handleCreate = async (data: CreateExpenseFormValues) => {
    await createMutation.mutateAsync(data);
  };

  const handleEditSubmit = async (data: UpdateExpenseFormValues) => {
    if (!editingExpense) return;
    await updateMutation.mutateAsync({ uuid: editingExpense.uuid, data });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Button
          onClick={() => {
            setDialogMode("create");
            setEditingExpense(null);
            setDialogOpen(true);
          }}
          disabled={cashAssets.length === 0}
        >
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
          {error instanceof Error ? error.message : "Failed to load expenses."}
        </p>
      )}

      <ExpenseList
        expenses={expenses}
        assets={assets}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        mode={dialogMode}
        expense={editingExpense}
        cashAssets={cashAssets}
        onSubmitCreate={handleCreate}
        onSubmitEdit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setExpenseToDelete(null);
        }}
        title="Delete expense?"
        description="This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
