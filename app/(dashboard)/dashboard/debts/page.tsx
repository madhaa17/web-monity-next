"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Debt } from "@/lib/api/types";
import type {
  CreateDebtFormValues,
  UpdateDebtFormValues,
  CreateDebtPaymentFormValues,
} from "@/lib/validations/debt";
import { useDebtsData } from "@/hooks/useDebtsData";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { DebtsContent } from "@/components/dashboard/debts/DebtsContent";

export default function DebtsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [debtForPayment, setDebtForPayment] = useState<Debt | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: assets = [] } = useQuery(assetsQueryOptions());
  const {
    debts,
    meta,
    page,
    setPage,
    limit,
    isLoading,
    isError,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
    addPaymentMutation,
  } = useDebtsData();

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (debt: Debt) => {
    setDebtToDelete(debt);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setDialogMode("create");
    setEditingDebt(null);
    setDialogOpen(true);
  };

  const handleRecordPayment = (debt: Debt) => {
    setDebtForPayment(debt);
    setPaymentDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingDebt(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setDebtToDelete(null);
  };

  const handlePaymentDialogOpenChange = (open: boolean) => {
    setPaymentDialogOpen(open);
    if (!open) setDebtForPayment(null);
  };

  const handleCreate = async (data: CreateDebtFormValues) => {
    await createMutation.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (data: UpdateDebtFormValues) => {
    if (!editingDebt) return;
    await updateMutation.mutateAsync({ uuid: editingDebt.uuid, data });
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!debtToDelete) return;
    await deleteMutation.mutateAsync(debtToDelete.uuid);
    setDeleteDialogOpen(false);
    setDebtToDelete(null);
  };

  const handlePaymentSubmit = async (data: CreateDebtPaymentFormValues) => {
    if (!debtForPayment) return;
    await addPaymentMutation.mutateAsync({ uuid: debtForPayment.uuid, data });
    setPaymentDialogOpen(false);
    setDebtForPayment(null);
  };

  return (
    <DebtsContent
      debts={debts}
      meta={meta}
      page={page}
      setPage={setPage}
      limit={limit}
      isLoading={isLoading}
      isError={isError}
      error={error}
      dialogOpen={dialogOpen}
      dialogMode={dialogMode}
      editingDebt={editingDebt}
      debtToDelete={debtToDelete}
      deleteDialogOpen={deleteDialogOpen}
      debtForPayment={debtForPayment}
      paymentDialogOpen={paymentDialogOpen}
      assets={assets}
      onAddClick={handleAddClick}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDialogOpenChange={handleDialogOpenChange}
      onDeleteDialogOpenChange={handleDeleteDialogOpenChange}
      onPaymentDialogOpenChange={handlePaymentDialogOpenChange}
      onCreate={handleCreate}
      onEditSubmit={handleEditSubmit}
      onConfirmDelete={handleConfirmDelete}
      onPaymentSubmit={handlePaymentSubmit}
      onRecordPayment={handleRecordPayment}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      isRecordingPayment={addPaymentMutation.isPending}
    />
  );
}
