"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Expense } from "@/lib/api/types";
import type { Asset } from "@/lib/api/types";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validations/expense";
import type { CreateExpenseFormValues, UpdateExpenseFormValues } from "@/lib/validations/expense";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "HOUSING",
  "UTILITIES",
  "HEALTH",
  "ENTERTAINMENT",
  "SHOPPING",
  "OTHER",
] as const;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  expense?: Expense | null;
  cashAssets: Asset[];
  onSubmitCreate: (data: CreateExpenseFormValues) => Promise<void>;
  onSubmitEdit: (data: UpdateExpenseFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  mode,
  expense,
  cashAssets,
  onSubmitCreate,
  onSubmitEdit,
  isSubmitting = false,
}: ExpenseFormDialogProps) {
  const isCreate = mode === "create";

  const createForm = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      assetUuid: "",
      amount: 0,
      category: "FOOD",
      note: "",
      date: todayISO(),
    },
  });

  const editForm = useForm<UpdateExpenseFormValues>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: { amount: 0, category: "FOOD", note: "", date: todayISO() },
  });

  useEffect(() => {
    if (open && expense && !isCreate) {
      editForm.reset({
        amount: toNumber(expense.amount),
        category: (expense.category as typeof CATEGORIES[number]) ?? "FOOD",
        note: (expense.note as string) ?? "",
        date: expense.date?.slice(0, 10) ?? todayISO(),
      });
    }
  }, [open, expense, isCreate, editForm]);

  useEffect(() => {
    if (open && isCreate) {
      createForm.reset({
        assetUuid: cashAssets[0]?.uuid ?? "",
        amount: 0,
        category: "FOOD",
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
          <DialogTitle>{isCreate ? "Add expense" : "Edit expense"}</DialogTitle>
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
                <Controller
                  control={createForm.control}
                  name="amount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="amount"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!createForm.formState.errors.amount}
                    />
                  )}
                />
                <FieldError errors={createForm.formState.errors.amount ? [createForm.formState.errors.amount] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <FieldContent>
                <Select
                  value={createForm.watch("category")}
                  onValueChange={(v) => createForm.setValue("category", v as typeof CATEGORIES[number])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Controller
                  control={editForm.control}
                  name="amount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="edit-amount"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!editForm.formState.errors.amount}
                    />
                  )}
                />
                <FieldError errors={editForm.formState.errors.amount ? [editForm.formState.errors.amount] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <FieldContent>
                <Select
                  value={editForm.watch("category")}
                  onValueChange={(v) => editForm.setValue("category", v as typeof CATEGORIES[number])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
