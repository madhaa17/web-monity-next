"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SavingGoal } from "@/lib/api/types";
import {
  createSavingGoalSchema,
  updateSavingGoalSchema,
} from "@/lib/validations/saving-goal";
import type {
  CreateSavingGoalFormValues,
  UpdateSavingGoalFormValues,
} from "@/lib/validations/saving-goal";
import { toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";

export interface SavingGoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  goal?: SavingGoal | null;
  onSubmitCreate: (data: CreateSavingGoalFormValues) => Promise<void>;
  onSubmitEdit: (data: UpdateSavingGoalFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function SavingGoalFormDialog({
  open,
  onOpenChange,
  mode,
  goal,
  onSubmitCreate,
  onSubmitEdit,
  isSubmitting = false,
}: SavingGoalFormDialogProps) {
  const isCreate = mode === "create";

  const createForm = useForm<CreateSavingGoalFormValues>({
    resolver: zodResolver(createSavingGoalSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
    },
  });

  const editForm = useForm<UpdateSavingGoalFormValues>({
    resolver: zodResolver(updateSavingGoalSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
    },
  });

  useEffect(() => {
    if (open && goal && !isCreate) {
      editForm.reset({
        title: goal.title,
        targetAmount: toNumber(goal.targetAmount),
        currentAmount: toNumber(goal.currentAmount),
        deadline: goal.deadline?.slice(0, 10) ?? "",
      });
    }
  }, [open, goal, isCreate, editForm]);

  useEffect(() => {
    if (open && isCreate) {
      createForm.reset({
        title: "",
        targetAmount: 0,
        currentAmount: 0,
        deadline: "",
      });
    }
  }, [open, isCreate, createForm]);

  const handleCreate = createForm.handleSubmit(async (data) => {
    await onSubmitCreate({
      ...data,
      deadline: data.deadline?.trim() || undefined,
    });
    onOpenChange(false);
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    await onSubmitEdit({
      ...data,
      deadline: data.deadline?.trim() || undefined,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Add saving goal" : "Edit saving goal"}
          </DialogTitle>
        </DialogHeader>
        {isCreate ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <FieldContent>
                <Input
                  id="title"
                  placeholder="e.g. Emergency fund"
                  {...createForm.register("title")}
                  aria-invalid={!!createForm.formState.errors.title}
                />
                <FieldError
                  errors={
                    createForm.formState.errors.title
                      ? [createForm.formState.errors.title]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="targetAmount">Target amount</FieldLabel>
              <FieldContent>
                <Controller
                  control={createForm.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="targetAmount"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!createForm.formState.errors.targetAmount}
                    />
                  )}
                />
                <FieldError
                  errors={
                    createForm.formState.errors.targetAmount
                      ? [createForm.formState.errors.targetAmount]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="currentAmount">Current amount</FieldLabel>
              <FieldContent>
                <Controller
                  control={createForm.control}
                  name="currentAmount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="currentAmount"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!createForm.formState.errors.currentAmount}
                    />
                  )}
                />
                <FieldError
                  errors={
                    createForm.formState.errors.currentAmount
                      ? [createForm.formState.errors.currentAmount]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="deadline">Deadline (optional)</FieldLabel>
              <FieldContent>
                <Input
                  id="deadline"
                  type="date"
                  {...createForm.register("deadline")}
                />
              </FieldContent>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="edit-title">Title</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-title"
                  placeholder="e.g. Emergency fund"
                  {...editForm.register("title")}
                  aria-invalid={!!editForm.formState.errors.title}
                />
                <FieldError
                  errors={
                    editForm.formState.errors.title
                      ? [editForm.formState.errors.title]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-targetAmount">Target amount</FieldLabel>
              <FieldContent>
                <Controller
                  control={editForm.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="edit-targetAmount"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!editForm.formState.errors.targetAmount}
                    />
                  )}
                />
                <FieldError
                  errors={
                    editForm.formState.errors.targetAmount
                      ? [editForm.formState.errors.targetAmount]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-currentAmount">Current amount</FieldLabel>
              <FieldContent>
                <Controller
                  control={editForm.control}
                  name="currentAmount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="edit-currentAmount"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!editForm.formState.errors.currentAmount}
                    />
                  )}
                />
                <FieldError
                  errors={
                    editForm.formState.errors.currentAmount
                      ? [editForm.formState.errors.currentAmount]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-deadline">Deadline (optional)</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-deadline"
                  type="date"
                  {...editForm.register("deadline")}
                />
              </FieldContent>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
