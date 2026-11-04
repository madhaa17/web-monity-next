"use client";

import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Asset } from "@/lib/api/types";
import type { CreatePaymentBody, Obligation, ObligationKind } from "@/lib/api/obligations";
import { paymentFormSchema, type PaymentFormValues } from "@/lib/validations/obligation";
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
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CashAssetSelect } from "@/components/dashboard/obligations/CashAssetSelect";
import { OBLIGATION_COPY } from "@/components/dashboard/obligations/copy";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface PaymentDialogProps {
  kind: ObligationKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Obligation | null;
  cashAssets: Asset[];
  onSubmit: (uuid: string, body: CreatePaymentBody) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function PaymentDialog({
  kind,
  open,
  onOpenChange,
  item,
  cashAssets,
  onSubmit,
  isSubmitting = false,
}: PaymentDialogProps) {
  const copy = OBLIGATION_COPY[kind];
  const remaining = item ? Math.max(toNumber(item.amount) - toNumber(item.paidAmount), 0) : 0;
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: { amount: 0, date: todayISO(), note: "", assetUuid: "" },
  });
  const { control, register, handleSubmit, reset, setValue, formState } = form;
  const errors = formState.errors;

  useEffect(() => {
    // Default to the asset the money originally moved through.
    if (open) reset({ amount: 0, date: todayISO(), note: "", assetUuid: item?.asset?.uuid ?? "" });
  }, [open, item, reset]);

  const submit = handleSubmit(async (data) => {
    if (!item) return;
    if (data.amount > remaining) {
      form.setError("amount", { message: `At most ${formatCurrency(remaining)} remains` });
      return;
    }
    try {
      await onSubmit(item.uuid, {
        amount: data.amount,
        date: `${data.date}T00:00:00Z`,
        note: data.note?.trim() || undefined,
        assetUuid: data.assetUuid || undefined,
      });
      onOpenChange(false);
    } catch {
      // The server's message is shown as a toast; keep the form open.
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {copy.recordPayment}
            {item ? ` · ${item.partyName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Remaining: <span className="text-foreground font-medium tabular-nums">{formatCurrency(remaining)}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="pay-amount">Amount</FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <CurrencyInput
                      id="pay-amount"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!errors.amount}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("amount", remaining, { shouldValidate: true })}
                >
                  Full remaining
                </Button>
              </div>
              <FieldError errors={errors.amount ? [errors.amount] : undefined} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="pay-date">Date</FieldLabel>
            <FieldContent>
              <Input id="pay-date" type="date" aria-invalid={!!errors.date} {...register("date")} />
              <FieldError errors={errors.date ? [errors.date] : undefined} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="pay-asset">{copy.paymentAsset}</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="assetUuid"
                render={({ field }) => (
                  <CashAssetSelect
                    id="pay-asset"
                    cashAssets={cashAssets}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldDescription>{copy.paymentAssetHint}</FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="pay-note">Note (optional)</FieldLabel>
            <FieldContent>
              <Input id="pay-note" placeholder="e.g. bank transfer" aria-invalid={!!errors.note} {...register("note")} />
              <FieldError errors={errors.note ? [errors.note] : undefined} />
            </FieldContent>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : copy.recordPayment}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
