"use client";

import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Asset } from "@/lib/api/types";
import type {
  CreateObligationBody,
  Obligation,
  ObligationKind,
  UpdateObligationBody,
} from "@/lib/api/obligations";
import { obligationFormSchema, type ObligationFormValues } from "@/lib/validations/obligation";
import { toNumber } from "@/lib/format";
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

const EMPTY: ObligationFormValues = { partyName: "", amount: 0, dueDate: "", note: "", assetUuid: "" };

function valuesFrom(item: Obligation): ObligationFormValues {
  return {
    partyName: item.partyName,
    amount: toNumber(item.amount),
    dueDate: item.dueDate?.slice(0, 10) ?? "",
    note: item.note ?? "",
    assetUuid: item.asset?.uuid ?? "",
  };
}

const toDueDate = (d?: string) => (d ? `${d}T00:00:00Z` : undefined);

export interface ObligationFormDialogProps {
  kind: ObligationKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The item being edited; null to create a new one. */
  item: Obligation | null;
  cashAssets: Asset[];
  onCreate: (body: CreateObligationBody) => Promise<unknown>;
  onUpdate: (uuid: string, body: UpdateObligationBody) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function ObligationFormDialog({
  kind,
  open,
  onOpenChange,
  item,
  cashAssets,
  onCreate,
  onUpdate,
  isSubmitting = false,
}: ObligationFormDialogProps) {
  const copy = OBLIGATION_COPY[kind];
  const isEdit = item !== null;
  const form = useForm<ObligationFormValues>({
    resolver: zodResolver(obligationFormSchema) as Resolver<ObligationFormValues>,
    defaultValues: EMPTY,
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  useEffect(() => {
    if (open) reset(item ? valuesFrom(item) : EMPTY);
  }, [open, item, reset]);

  const submit = handleSubmit(async (data) => {
    const note = data.note?.trim() ?? "";
    try {
      if (item) {
        // Send every field so clearing the due date, note or asset takes effect.
        await onUpdate(item.uuid, {
          partyName: data.partyName.trim(),
          amount: data.amount,
          dueDate: toDueDate(data.dueDate) ?? null,
          note: note || null,
          assetUuid: data.assetUuid || null,
        });
      } else {
        await onCreate({
          partyName: data.partyName.trim(),
          amount: data.amount,
          dueDate: toDueDate(data.dueDate),
          note: note || undefined,
          assetUuid: data.assetUuid || undefined,
        });
      }
      onOpenChange(false);
    } catch {
      // The server's message (e.g. insufficient balance) is shown as a toast; keep the form open.
    }
  });

  const paid = item ? toNumber(item.paidAmount) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${copy.noun}` : copy.add}</DialogTitle>
          <DialogDescription>{copy.subtitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="ob-party">{copy.party}</FieldLabel>
            <FieldContent>
              <Input
                id="ob-party"
                placeholder={copy.partyPlaceholder}
                aria-invalid={!!errors.partyName}
                {...register("partyName")}
              />
              <FieldError errors={errors.partyName ? [errors.partyName] : undefined} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="ob-amount">Amount</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <CurrencyInput
                    id="ob-amount"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.amount}
                  />
                )}
              />
              {paid > 0 && (
                <FieldDescription>Cannot be less than what has already been {copy.paid.toLowerCase()}.</FieldDescription>
              )}
              <FieldError errors={errors.amount ? [errors.amount] : undefined} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="ob-due">Due date (optional)</FieldLabel>
            <FieldContent>
              <Input id="ob-due" type="date" {...register("dueDate")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="ob-asset">{copy.openAsset}</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="assetUuid"
                render={({ field }) => (
                  <CashAssetSelect
                    id="ob-asset"
                    cashAssets={cashAssets}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldDescription>{copy.openAssetHint}</FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="ob-note">Note (optional)</FieldLabel>
            <FieldContent>
              <Input id="ob-note" placeholder="e.g. for rent" aria-invalid={!!errors.note} {...register("note")} />
              <FieldError errors={errors.note ? [errors.note] : undefined} />
            </FieldContent>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save" : copy.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
