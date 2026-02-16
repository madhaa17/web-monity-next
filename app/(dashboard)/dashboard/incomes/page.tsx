"use client";

import { useState } from "react";
import type { Income } from "@/lib/api/types";
import type { CreateIncomeFormValues, UpdateIncomeFormValues } from "@/lib/validations/income";
import { useIncomesData } from "@/hooks/useIncomesData";
import { IncomesContent } from "@/components/dashboard/incomes/IncomesContent";

export default function IncomesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    incomes,
    meta,
    page,
    setPage,
    limit,
    month,
    setMonth,
    year,
    setYear,
    assets,
    cashAssets,
    isLoading,
    isError,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useIncomesData();

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (income: Income) => {
    setIncomeToDelete(income);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setDialogMode("create");
    setEditingIncome(null);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingIncome(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setIncomeToDelete(null);
  };

  const handleCreate = async (data: CreateIncomeFormValues) => {
    await createMutation.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (data: UpdateIncomeFormValues) => {
    if (!editingIncome) return;
    await updateMutation.mutateAsync({ uuid: editingIncome.uuid, data });
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!incomeToDelete) return;
    await deleteMutation.mutateAsync(incomeToDelete.uuid);
    setDeleteDialogOpen(false);
    setIncomeToDelete(null);
  };

  return (
    <IncomesContent
      incomes={incomes}
      meta={meta}
      page={page}
      setPage={setPage}
      limit={limit}
      month={month}
      setMonth={setMonth}
      year={year}
      setYear={setYear}
      assets={assets}
      cashAssets={cashAssets}
      isLoading={isLoading}
      isError={isError}
      error={error}
      dialogOpen={dialogOpen}
      dialogMode={dialogMode}
      editingIncome={editingIncome}
      incomeToDelete={incomeToDelete}
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
