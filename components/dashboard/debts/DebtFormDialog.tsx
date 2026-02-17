"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Debt } from "@/lib/api/types";
import type { Asset } from "@/lib/api/types";
import {
  createDebtSchema,
  updateDebtSchema,
} from "@/lib/validations/debt";
import type {
  CreateDebtFormValues,
  UpdateDebtFormValues,
} from "@/lib/validations/debt";
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

export interface DebtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  debt?: Debt | null;
  assets?: Asset[];
  onSubmitCreate: (data: CreateDebtFormValues) => Promise<void>;
  onSubmitEdit: (data: UpdateDebtFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function DebtFormDialog({
  open,
  onOpenChange,
  mode,
  debt,
  assets = [],
  onSubmitCreate,
  onSubmitEdit,
  isSubmitting = false,
}: DebtFormDialogProps) {
  const isCreate = mode === "create";

  const createForm = useForm<CreateDebtFormValues>({
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      partyName: "",
      amount: 0,
      dueDate: "",
      note: "",
      assetUuid: "",
    },
  });

  const editForm = useForm<UpdateDebtFormValues>({
    resolver: zodResolver(updateDebtSchema),
    defaultValues: {
      partyName: "",
      amount: 0,
      dueDate: "",
      note: "",
      assetUuid: "",
    },
  });

  useEffect(() => {
    if (open && debt && !isCreate) {
      editForm.reset({
        partyName: debt.partyName ?? "",
        amount: toNumber(debt.amount),
        dueDate: debt.dueDate?.slice(0, 10) ?? "",
        note: (debt.note as string) ?? "",
        assetUuid: (debt.asset as { uuid?: string })?.uuid ?? "",
      });
    }
  }, [open, debt, isCreate, editForm]);

  useEffect(() => {
    if (open && isCreate) {
      createForm.reset({
        partyName: "",
        amount: 0,
        dueDate: "",
        note: "",
        assetUuid: "",
      });
    }
  }, [open, isCreate, createForm]);

  const handleCreate = createForm.handleSubmit(async (data) => {
    await onSubmitCreate({
      ...data,
      dueDate: data.dueDate?.trim() || undefined,
      note: data.note?.trim() || undefined,
      assetUuid: data.assetUuid?.trim() || undefined,
    });
    onOpenChange(false);
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    await onSubmitEdit({
      ...data,
      dueDate: data.dueDate?.trim() || undefined,
      note: data.note?.trim() || undefined,
      assetUuid: data.assetUuid?.trim() || undefined,
    });
    onOpenChange(false);
  });

  const ASSET_NONE = "__none__";
  const assetSelectField = (
    value: string,
    onValueChange: (v: string) => void
  ) =>
    assets.length > 0 ? (
      <Field>
        <FieldLabel>Linked asset (optional)</FieldLabel>
        <FieldContent>
          <Select value={value || ASSET_NONE} onValueChange={onValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ASSET_NONE}>None</SelectItem>
              {assets.map((a) => (
                <SelectItem key={a.uuid} value={a.uuid}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Add debt" : "Edit debt"}
          </DialogTitle>
        </DialogHeader>
        {isCreate ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="partyName">Party name</FieldLabel>
              <FieldContent>
                <Input
                  id="partyName"
                  {...createForm.register("partyName")}
                  placeholder="Who you owe"
                  aria-invalid={!!createForm.formState.errors.partyName}
                />
                <FieldError
                  errors={
                    createForm.formState.errors.partyName
                      ? [createForm.formState.errors.partyName]
                      : undefined
                  }
                />
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
                <FieldError
                  errors={
                    createForm.formState.errors.amount
                      ? [createForm.formState.errors.amount]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="dueDate">Due date (optional)</FieldLabel>
              <FieldContent>
                <Input
                  id="dueDate"
                  type="date"
                  {...createForm.register("dueDate")}
                />
              </FieldContent>
            </Field>
            {assetSelectField(
              createForm.watch("assetUuid") ?? "",
              (v) => createForm.setValue("assetUuid", v === ASSET_NONE ? "" : v)
            )}
            <Field>
              <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
              <FieldContent>
                <Input id="note" {...createForm.register("note")} placeholder="Optional note" />
              </FieldContent>
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Add debt"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="edit-partyName">Party name</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-partyName"
                  {...editForm.register("partyName")}
                  placeholder="Who you owe"
                  aria-invalid={!!editForm.formState.errors.partyName}
                />
                <FieldError
                  errors={
                    editForm.formState.errors.partyName
                      ? [editForm.formState.errors.partyName]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-amount">Amount</FieldLabel>
              <FieldContent>
                <Controller
                  control={editForm.control}
                  name="amount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="edit-amount"
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      aria-invalid={!!editForm.formState.errors.amount}
                    />
                  )}
                />
                <FieldError
                  errors={
                    editForm.formState.errors.amount
                      ? [editForm.formState.errors.amount]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-dueDate">Due date (optional)</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-dueDate"
                  type="date"
                  {...editForm.register("dueDate")}
                />
              </FieldContent>
            </Field>
            {assetSelectField(
              editForm.watch("assetUuid") ?? "",
              (v) => editForm.setValue("assetUuid", v === ASSET_NONE ? "" : v)
            )}
            <Field>
              <FieldLabel htmlFor="edit-note">Note (optional)</FieldLabel>
              <FieldContent>
                <Input id="edit-note" {...editForm.register("note")} placeholder="Optional note" />
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
