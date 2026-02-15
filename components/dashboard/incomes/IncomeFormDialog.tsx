"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Income } from "@/lib/api/types";
import type { Asset } from "@/lib/api/types";
import { createIncomeSchema, updateIncomeSchema } from "@/lib/validations/income";
import type { CreateIncomeFormValues, UpdateIncomeFormValues } from "@/lib/validations/income";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface IncomeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  income?: Income | null;
  cashAssets: Asset[];
  onSubmitCreate: (data: CreateIncomeFormValues) => Promise<void>;
  onSubmitEdit: (data: UpdateIncomeFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function IncomeFormDialog({
  open,
  onOpenChange,
  mode,
  income,
  cashAssets,
  onSubmitCreate,
  onSubmitEdit,
  isSubmitting = false,
}: IncomeFormDialogProps) {
  const isCreate = mode === "create";

  const createForm = useForm<CreateIncomeFormValues>({
    resolver: zodResolver(createIncomeSchema),
    defaultValues: {
      assetUuid: "",
      amount: 0,
      source: "Other",
      note: "",
      date: todayISO(),
    },
  });

  const editForm = useForm<UpdateIncomeFormValues>({
    resolver: zodResolver(updateIncomeSchema),
    defaultValues: { amount: 0, source: "", note: "", date: todayISO() },
  });

  useEffect(() => {
    if (open && income && !isCreate) {
      editForm.reset({
        amount: toNumber(income.amount),
        source: (income.source as string) ?? "",
        note: (income.note as string) ?? "",
        date: income.date?.slice(0, 10) ?? todayISO(),
      });
    }
  }, [open, income, isCreate, editForm]);

  useEffect(() => {
    if (open && isCreate) {
      createForm.reset({
        assetUuid: cashAssets[0]?.uuid ?? "",
        amount: 0,
        source: "Other",
        note: "",
        date: todayISO(),
      });
    }
  }, [open, isCreate, cashAssets, createForm]);

  const handleCreate = createForm.handleSubmit(async (data) => {
    await onSubmitCreate({
      ...data,
      date: data.date.includes("T") ? data.date : `${data.date}T00:00:00Z`,
    });
    onOpenChange(false);
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    await onSubmitEdit({
      ...data,
      date: data.date.includes("T") ? data.date : `${data.date}T00:00:00Z`,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add income" : "Edit income"}</DialogTitle>
        </DialogHeader>
        {isCreate ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Asset (CASH)</FieldLabel>
              <FieldContent>
                <Select
                  value={createForm.watch("assetUuid")}
                  onValueChange={(v) => createForm.setValue("assetUuid", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashAssets.map((a) => (
                      <SelectItem key={a.uuid} value={a.uuid}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={createForm.formState.errors.assetUuid ? [createForm.formState.errors.assetUuid] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>
              <FieldContent>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  {...createForm.register("amount", { valueAsNumber: true })}
                  aria-invalid={!!createForm.formState.errors.amount}
                />
                <FieldError errors={createForm.formState.errors.amount ? [createForm.formState.errors.amount] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="source">Source</FieldLabel>
              <FieldContent>
                <Input
                  id="source"
                  placeholder="e.g. Salary, Other"
                  {...createForm.register("source")}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
              <FieldContent>
                <Input id="note" {...createForm.register("note")} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <FieldContent>
                <Input
                  id="date"
                  type="date"
                  {...createForm.register("date")}
                  aria-invalid={!!createForm.formState.errors.date}
                />
                <FieldError errors={createForm.formState.errors.date ? [createForm.formState.errors.date] : undefined} />
              </FieldContent>
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
              <FieldLabel htmlFor="edit-amount">Amount</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-amount"
                  type="number"
                  step="any"
                  {...editForm.register("amount", { valueAsNumber: true })}
                  aria-invalid={!!editForm.formState.errors.amount}
                />
                <FieldError errors={editForm.formState.errors.amount ? [editForm.formState.errors.amount] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-source">Source (optional)</FieldLabel>
              <FieldContent>
                <Input id="edit-source" {...editForm.register("source")} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-note">Note (optional)</FieldLabel>
              <FieldContent>
                <Input id="edit-note" {...editForm.register("note")} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-date">Date</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-date"
                  type="date"
                  {...editForm.register("date")}
                  aria-invalid={!!editForm.formState.errors.date}
                />
                <FieldError errors={editForm.formState.errors.date ? [editForm.formState.errors.date] : undefined} />
              </FieldContent>
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
