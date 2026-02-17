"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Receivable } from "@/lib/api/types";
import type {
  CreateReceivableFormValues,
  UpdateReceivableFormValues,
  CreateReceivablePaymentFormValues,
} from "@/lib/validations/receivable";
import { useReceivablesData } from "@/hooks/useReceivablesData";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { ReceivablesContent } from "@/components/dashboard/receivables/ReceivablesContent";

export default function ReceivablesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [receivableToDelete, setReceivableToDelete] = useState<Receivable | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [receivableForPayment, setReceivableForPayment] = useState<Receivable | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: assets = [] } = useQuery(assetsQueryOptions());
  const {
    receivables,
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
  } = useReceivablesData();

  const handleEdit = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (receivable: Receivable) => {
    setReceivableToDelete(receivable);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setDialogMode("create");
    setEditingReceivable(null);
    setDialogOpen(true);
  };

  const handleRecordPayment = (receivable: Receivable) => {
    setReceivableForPayment(receivable);
    setPaymentDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingReceivable(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setReceivableToDelete(null);
  };

  const handlePaymentDialogOpenChange = (open: boolean) => {
    setPaymentDialogOpen(open);
    if (!open) setReceivableForPayment(null);
  };

  const handleCreate = async (data: CreateReceivableFormValues) => {
    await createMutation.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (data: UpdateReceivableFormValues) => {
    if (!editingReceivable) return;
    await updateMutation.mutateAsync({ uuid: editingReceivable.uuid, data });
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!receivableToDelete) return;
    await deleteMutation.mutateAsync(receivableToDelete.uuid);
    setDeleteDialogOpen(false);
    setReceivableToDelete(null);
  };

  const handlePaymentSubmit = async (data: CreateReceivablePaymentFormValues) => {
    if (!receivableForPayment) return;
    await addPaymentMutation.mutateAsync({
      uuid: receivableForPayment.uuid,
      data,
    });
    setPaymentDialogOpen(false);
    setReceivableForPayment(null);
  };

  return (
    <ReceivablesContent
      receivables={receivables}
      meta={meta}
      page={page}
      setPage={setPage}
      limit={limit}
      isLoading={isLoading}
      isError={isError}
      error={error}
      dialogOpen={dialogOpen}
      dialogMode={dialogMode}
      editingReceivable={editingReceivable}
      receivableToDelete={receivableToDelete}
      deleteDialogOpen={deleteDialogOpen}
      receivableForPayment={receivableForPayment}
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
