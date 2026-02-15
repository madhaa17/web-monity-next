"use client";

import { useState } from "react";
import type { Expense } from "@/lib/api/types";
import type { CreateExpenseFormValues, UpdateExpenseFormValues } from "@/lib/validations/expense";
import { useExpensesData } from "@/hooks/useExpensesData";
import { ExpensesContent } from "@/components/dashboard/expenses/ExpensesContent";

export default function ExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    expenses,
    assets,
    cashAssets,
    isLoading,
    isError,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useExpensesData();

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setDialogMode("create");
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingExpense(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setExpenseToDelete(null);
  };

  const handleCreate = async (data: CreateExpenseFormValues) => {
    await createMutation.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (data: UpdateExpenseFormValues) => {
    if (!editingExpense) return;
    await updateMutation.mutateAsync({ uuid: editingExpense.uuid, data });
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    await deleteMutation.mutateAsync(expenseToDelete.uuid);
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  return (
    <ExpensesContent
      expenses={expenses}
      assets={assets}
      cashAssets={cashAssets}
      isLoading={isLoading}
      isError={isError}
      error={error}
      dialogOpen={dialogOpen}
      dialogMode={dialogMode}
      editingExpense={editingExpense}
      expenseToDelete={expenseToDelete}
      deleteDialogOpen={deleteDialogOpen}
      onAddClick={handleAddClick}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDialogOpenChange={handleDialogOpenChange}
      onDeleteDialogOpenChange={handleDeleteDialogOpenChange}
      onCreate={handleCreate}
      onEditSubmit={handleEditSubmit}
      onConfirmDelete={handleConfirmDelete}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
}
