"use client";

import { useState } from "react";
import type { SavingGoal } from "@/lib/api/types";
import type {
  CreateSavingGoalFormValues,
  UpdateSavingGoalFormValues,
} from "@/lib/validations/saving-goal";
import { useSavingGoalsData } from "@/hooks/useSavingGoalsData";
import { SavingGoalsContent } from "@/components/dashboard/saving-goals/SavingGoalsContent";

export default function SavingGoalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingGoal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    goals,
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
  } = useSavingGoalsData();

  const handleEdit = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (goal: SavingGoal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setDialogMode("create");
    setEditingGoal(null);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingGoal(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setGoalToDelete(null);
  };

  const handleCreate = async (data: CreateSavingGoalFormValues) => {
    await createMutation.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (data: UpdateSavingGoalFormValues) => {
    if (!editingGoal) return;
    await updateMutation.mutateAsync({ uuid: editingGoal.uuid, data });
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    await deleteMutation.mutateAsync(goalToDelete.uuid);
    setDeleteDialogOpen(false);
    setGoalToDelete(null);
  };

  return (
    <SavingGoalsContent
      goals={goals}
      meta={meta}
      page={page}
      setPage={setPage}
      limit={limit}
      isLoading={isLoading}
      isError={isError}
      error={error}
      dialogOpen={dialogOpen}
      dialogMode={dialogMode}
      editingGoal={editingGoal}
      goalToDelete={goalToDelete}
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
