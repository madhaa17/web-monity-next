"use client";

import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Asset, Category, Income, TransactionBody, TransactionKind } from "@/lib/api/types";
import type { Transaction } from "@/lib/api/transactions";
import {
  expenseFormSchema,
  incomeFormSchema,
  type TransactionFormValues,
} from "@/lib/validations/transaction";
import { formatCurrency, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelect } from "@/components/dashboard/transactions/CategorySelect";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyValues(cashAssets: Asset[]): TransactionFormValues {
  return {
    assetUuid: cashAssets[0]?.uuid ?? "",
    amount: 0,
    categoryUuid: "",
    source: "",
    note: "",
    date: todayISO(),
  };
}

function valuesFrom(item: Transaction<TransactionKind>): TransactionFormValues {
  return {
    assetUuid: item.assetUuid ?? "",
    amount: toNumber(item.amount),
    categoryUuid: item.categoryUuid ?? "",
    source: (item as Income).source ?? "",
    note: item.note ?? "",
    date: item.date?.slice(0, 10) ?? todayISO(),
  };
}

export interface TransactionFormDialogProps<K extends TransactionKind> {
  kind: K;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The item being edited; null to create a new one. */
  item: Transaction<K> | null;
  cashAssets: Asset[];
  categories: Category[];
  onSubmit: (body: TransactionBody) => Promise<void>;
  isSubmitting?: boolean;
}

export function TransactionFormDialog<K extends TransactionKind>({
  kind,
  open,
  onOpenChange,
  item,
  cashAssets,
  categories,
  onSubmit,
  isSubmitting = false,
}: TransactionFormDialogProps<K>) {
  const isIncome = kind === "income";
  const isEdit = item !== null;
  const noun = isIncome ? "income" : "expense";

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(isIncome ? incomeFormSchema : expenseFormSchema) as Resolver<TransactionFormValues>,
    defaultValues: emptyValues(cashAssets),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  useEffect(() => {
    if (open) reset(item ? valuesFrom(item) : emptyValues(cashAssets));
  }, [open, item, cashAssets, reset]);

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit({
        assetUuid: data.assetUuid,
        amount: data.amount,
        categoryUuid: data.categoryUuid,
        ...(isIncome ? { source: data.source?.trim() } : {}),
        note: data.note?.trim() ?? "",
        date: `${data.date}T00:00:00Z`,
      });
      onOpenChange(false);
    } catch {
      // The server's message (e.g. insufficient balance) is shown as a toast; keep the form open.
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${noun}` : `Add ${noun}`}</DialogTitle>
          <DialogDescription>
            {isIncome
              ? "The amount is added to the selected cash asset."
              : "The amount is taken from the selected cash asset."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="tx-amount">Amount</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <CurrencyInput
                    id="tx-amount"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.amount}
                  />
                )}
              />
              <FieldError errors={errors.amount ? [errors.amount] : undefined} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="tx-category">Category</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="categoryUuid"
                render={({ field }) => (
                  <CategorySelect
                    id="tx-category"
                    categories={categories}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={!!errors.categoryUuid}
                  />
                )}
              />
              <FieldError errors={errors.categoryUuid ? [errors.categoryUuid] : undefined} />
            </FieldContent>
          </Field>

          {isIncome && (
            <Field>
              <FieldLabel htmlFor="tx-source">Source</FieldLabel>
              <FieldContent>
                <Input
                  id="tx-source"
                  placeholder="e.g. employer or client name"
                  {...register("source")}
                  aria-invalid={!!errors.source}
                />
                <FieldError errors={errors.source ? [errors.source] : undefined} />
              </FieldContent>
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="tx-asset">{isIncome ? "Deposit to" : "Paid from"}</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="assetUuid"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tx-asset" className="w-full" aria-invalid={!!errors.assetUuid}>
                      <SelectValue placeholder="Select cash asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {cashAssets.map((a) => (
                        <SelectItem key={a.uuid} value={a.uuid}>
                          <span>{a.name}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {formatCurrency(toNumber(a.quantity))}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={errors.assetUuid ? [errors.assetUuid] : undefined} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="tx-date">Date</FieldLabel>
            <FieldContent>
              <Input id="tx-date" type="date" {...register("date")} aria-invalid={!!errors.date} />
              <FieldError errors={errors.date ? [errors.date] : undefined} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="tx-note">Note (optional)</FieldLabel>
            <FieldContent>
              <Input id="tx-note" {...register("note")} aria-invalid={!!errors.note} />
              <FieldError errors={errors.note ? [errors.note] : undefined} />
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
      </DialogContent>
    </Dialog>
  );
}
