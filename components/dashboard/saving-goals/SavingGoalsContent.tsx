"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { SavingGoalFormDialog } from "@/components/dashboard/saving-goals/SavingGoalFormDialog";
import { SavingGoalList } from "@/components/dashboard/saving-goals/SavingGoalList";
import type { SavingGoal } from "@/lib/api/types";
import type {
  CreateSavingGoalFormValues,
  UpdateSavingGoalFormValues,
} from "@/lib/validations/saving-goal";
import { Plus } from "lucide-react";

export interface SavingGoalsContentProps {
  goals: SavingGoal[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingGoal: SavingGoal | null;
  goalToDelete: SavingGoal | null;
  deleteDialogOpen: boolean;
  onAddClick: () => void;
  onEdit: (goal: SavingGoal) => void;
  onDelete: (goal: SavingGoal) => void;
  onDialogOpenChange: (open: boolean) => void;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onCreate: (data: CreateSavingGoalFormValues) => Promise<void>;
  onEditSubmit: (data: UpdateSavingGoalFormValues) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  isSubmitting: boolean;
  isDeleting: boolean;
}

export function SavingGoalsContent({
  goals,
  isLoading,
  isError,
  error,
  dialogOpen,
  dialogMode,
  editingGoal,
  goalToDelete,
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
}: SavingGoalsContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Saving goals</h1>
        <Button onClick={onAddClick}>
          <Plus className="size-4" />
          Add saving goal
        </Button>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message ?? "Failed to load saving goals."}
        </p>
      )}

      <SavingGoalList
        goals={goals}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <SavingGoalFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        mode={dialogMode}
        goal={editingGoal}
        onSubmitCreate={onCreate}
        onSubmitEdit={onEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title="Delete saving goal?"
        description="This action cannot be undone."
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
