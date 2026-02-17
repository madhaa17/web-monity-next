"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Receivable } from "@/lib/api/types";
import type { Asset } from "@/lib/api/types";
import { createReceivablePaymentSchema } from "@/lib/validations/receivable";
import type { CreateReceivablePaymentFormValues } from "@/lib/validations/receivable";
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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ReceivablePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: Receivable | null;
  assets?: Asset[];
  onSubmit: (data: CreateReceivablePaymentFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function ReceivablePaymentDialog({
  open,
  onOpenChange,
  receivable,
  assets = [],
  onSubmit,
  isSubmitting = false,
}: ReceivablePaymentDialogProps) {
  const form = useForm<CreateReceivablePaymentFormValues>({
    resolver: zodResolver(createReceivablePaymentSchema),
    defaultValues: {
      amount: 0,
      date: todayISO(),
      note: "",
      assetUuid: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: 0,
        date: todayISO(),
        note: "",
        assetUuid: "",
      });
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      note: data.note?.trim() || undefined,
      assetUuid: data.assetUuid?.trim() || undefined,
    });
    onOpenChange(false);
  });

  if (!receivable) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment — {receivable.partyName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="payment-amount">Amount</FieldLabel>
            <FieldContent>
              <Controller
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <CurrencyInput
                    id="payment-amount"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!form.formState.errors.amount}
                  />
                )}
              />
              <FieldError
                errors={
                  form.formState.errors.amount
                    ? [form.formState.errors.amount]
                    : undefined
                }
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="payment-date">Date</FieldLabel>
            <FieldContent>
              <Input
                id="payment-date"
                type="date"
                {...form.register("date")}
                aria-invalid={!!form.formState.errors.date}
              />
              <FieldError
                errors={
                  form.formState.errors.date
                    ? [form.formState.errors.date]
                    : undefined
                }
              />
            </FieldContent>
          </Field>
          {assets.length > 0 && (
            <Field>
              <FieldLabel>Destination asset (optional)</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch("assetUuid") || "__none__"}
                  onValueChange={(v) => form.setValue("assetUuid", v === "__none__" ? "" : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {assets.map((a) => (
                      <SelectItem key={a.uuid} value={a.uuid}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="payment-note">Note (optional)</FieldLabel>
            <FieldContent>
              <Input id="payment-note" {...form.register("note")} placeholder="Optional note" />
            </FieldContent>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
