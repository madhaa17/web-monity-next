"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Asset } from "@/lib/api/types";
import type { AssetType } from "@/lib/api/types";
import { createAssetSchema, updateAssetSchema } from "@/lib/validations/asset";
import type {
  CreateAssetFormValues,
  UpdateAssetFormValues,
} from "@/lib/validations/asset";
import { toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
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

const ASSET_TYPES: AssetType[] = ["CASH", "CRYPTO", "STOCK"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  asset?: Asset | null;
  onSubmitCreate: (data: CreateAssetFormValues) => Promise<void>;
  onSubmitEdit: (data: UpdateAssetFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function AssetFormDialog({
  open,
  onOpenChange,
  mode,
  asset,
  onSubmitCreate,
  onSubmitEdit,
  isSubmitting = false,
}: AssetFormDialogProps) {
  const isCreate = mode === "create";

  const createForm = useForm<CreateAssetFormValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: "",
      type: "CASH",
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: todayISO(),
      purchaseCurrency: "IDR",
      totalCost: 0,
      symbol: "",
      notes: "",
    },
  });

  const editForm = useForm<UpdateAssetFormValues>({
    resolver: zodResolver(updateAssetSchema),
    defaultValues: { name: "", quantity: 0, symbol: "", notes: "" },
  });

  useEffect(() => {
    if (open && asset && !isCreate) {
      editForm.reset({
        name: asset.name ?? "",
        quantity: toNumber(asset.quantity),
        symbol: (asset.symbol as string) ?? "",
        notes: (asset.notes as string) ?? "",
      });
    }
  }, [open, asset, isCreate, editForm]);

  useEffect(() => {
    if (open && isCreate) {
      createForm.reset({
        name: "",
        type: "CASH",
        quantity: 1,
        purchasePrice: 0,
        purchaseDate: todayISO(),
        purchaseCurrency: "IDR",
        totalCost: 0,
        symbol: "",
        notes: "",
      });
    }
  }, [open, isCreate, createForm]);

  const createType = createForm.watch("type");
  const createTotalCost = createForm.watch("totalCost");
  useEffect(() => {
    if (createType === "CASH" && open && isCreate) {
      const amount = Number(createTotalCost) || 0;
      createForm.setValue("quantity", amount);
      createForm.setValue("purchasePrice", 1);
    }
  }, [createType, createTotalCost, open, isCreate, createForm]);

  const handleCreate = createForm.handleSubmit(async (data) => {
    const isCash = data.type === "CASH";
    const amount = isCash ? Number(data.totalCost) || 0 : data.purchasePrice * data.quantity;
    const payload = {
      ...data,
      quantity: isCash ? amount : data.quantity,
      purchasePrice: isCash ? 1 : data.purchasePrice,
      totalCost: isCash ? amount : (data.totalCost || data.purchasePrice * data.quantity),
      purchaseDate: isCash ? todayISO() : data.purchaseDate,
      purchaseCurrency: isCash ? "IDR" : data.purchaseCurrency,
    };
    await onSubmitCreate(payload);
    onOpenChange(false);
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    await onSubmitEdit(data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add asset" : "Edit asset"}</DialogTitle>
        </DialogHeader>
        {isCreate ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="BBCA Stock, BTC, Main savings Bank Account, etc."
                  {...createForm.register("name")}
                  aria-invalid={!!createForm.formState.errors.name}
                />
                <FieldError
                  errors={
                    createForm.formState.errors.name
                      ? [createForm.formState.errors.name]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Type</FieldLabel>
              <FieldContent>
                <Select
                  value={createForm.watch("type")}
                  onValueChange={(v) => {
                    const type = v as AssetType;
                    createForm.setValue("type", type);
                    if (type === "CASH") {
                      const total = createForm.getValues("totalCost") || 0;
                      createForm.setValue("quantity", total);
                      createForm.setValue("purchasePrice", 1);
                      createForm.setValue("totalCost", total);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t === "CASH" ? "Cash" : t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            {(createType === "CRYPTO" || createType === "STOCK") && (
              <Field>
                <FieldLabel htmlFor="symbol">Symbol</FieldLabel>
                <FieldContent>
                  <Input
                    id="symbol"
                    placeholder={createType === "CRYPTO" ? "e.g. BTC, ETH" : "e.g. BBCA, GOTO"}
                    {...createForm.register("symbol")}
                    aria-invalid={!!createForm.formState.errors.symbol}
                  />
                  <FieldError
                    errors={
                      createForm.formState.errors.symbol
                        ? [createForm.formState.errors.symbol]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            )}

            {createForm.watch("type") === "CASH" ? (
              <Field>
                <FieldLabel htmlFor="cashAmount">Amount</FieldLabel>
                <FieldContent>
                  <Controller
                    control={createForm.control}
                    name="totalCost"
                    render={({ field }) => (
                      <CurrencyInput
                        id="cashAmount"
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={!!createForm.formState.errors.totalCost}
                      />
                    )}
                  />
                  <FieldError
                    errors={
                      createForm.formState.errors.totalCost
                        ? [createForm.formState.errors.totalCost]
                        : undefined
                    }
                  />
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    Enter your current cash balance.
                  </p>
                </FieldContent>
              </Field>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                  <FieldContent>
                    <Input
                      id="quantity"
                      type="number"
                      step="any"
                      min={0}
                      {...createForm.register("quantity", { valueAsNumber: true })}
                      aria-invalid={!!createForm.formState.errors.quantity}
                    />
                    <FieldError
                      errors={
                        createForm.formState.errors.quantity
                          ? [createForm.formState.errors.quantity]
                          : undefined
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="purchasePrice">Purchase price per unit</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={createForm.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <CurrencyInput
                          id="purchasePrice"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          aria-invalid={!!createForm.formState.errors.purchasePrice}
                        />
                      )}
                    />
                    <FieldError
                      errors={
                        createForm.formState.errors.purchasePrice
                          ? [createForm.formState.errors.purchasePrice]
                          : undefined
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="totalCost">Total cost</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={createForm.control}
                      name="totalCost"
                      render={({ field }) => (
                        <CurrencyInput
                          id="totalCost"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          aria-invalid={!!createForm.formState.errors.totalCost}
                        />
                      )}
                    />
                    <FieldError
                      errors={
                        createForm.formState.errors.totalCost
                          ? [createForm.formState.errors.totalCost]
                          : undefined
                      }
                    />
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      Leave 0 to use quantity × price per unit.
                    </p>
                  </FieldContent>
                </Field>
              </>
            )}

            {createForm.watch("type") !== "CASH" && (
              <Field>
                <FieldLabel htmlFor="purchaseDate">Purchase date</FieldLabel>
                <FieldContent>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...createForm.register("purchaseDate")}
                    aria-invalid={!!createForm.formState.errors.purchaseDate}
                  />
                  <FieldError
                    errors={
                      createForm.formState.errors.purchaseDate
                        ? [createForm.formState.errors.purchaseDate]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            )}
            <div className="w-full hidden">
              <Field>
                <FieldLabel htmlFor="purchaseCurrency">Currency</FieldLabel>
                <FieldContent>
                  <Input
                    id="purchaseCurrency"
                    {...createForm.register("purchaseCurrency")}
                    aria-invalid={
                      !!createForm.formState.errors.purchaseCurrency
                    }
                  />
                  <FieldError
                    errors={
                      createForm.formState.errors.purchaseCurrency
                        ? [createForm.formState.errors.purchaseCurrency]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <FieldContent>
                <Input id="notes" placeholder="e.g. Main savings bank account, etc." {...createForm.register("notes")} />
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
              <FieldLabel htmlFor="edit-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  aria-invalid={!!editForm.formState.errors.name}
                />
                <FieldError
                  errors={
                    editForm.formState.errors.name
                      ? [editForm.formState.errors.name]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            {asset?.type === "CASH" ? (
              <Field>
                <FieldLabel htmlFor="edit-amount">Amount</FieldLabel>
                <FieldContent>
                  <Controller
                    control={editForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <CurrencyInput
                        id="edit-amount"
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={!!editForm.formState.errors.quantity}
                      />
                    )}
                  />
                  <FieldError
                    errors={
                      editForm.formState.errors.quantity
                        ? [editForm.formState.errors.quantity]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="edit-quantity">Quantity</FieldLabel>
                <FieldContent>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="any"
                    {...editForm.register("quantity", { valueAsNumber: true })}
                    aria-invalid={!!editForm.formState.errors.quantity}
                  />
                  <FieldError
                    errors={
                      editForm.formState.errors.quantity
                        ? [editForm.formState.errors.quantity]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            )}
            {(asset?.type === "CRYPTO" || asset?.type === "STOCK") && (
              <Field>
                <FieldLabel htmlFor="edit-symbol">Symbol</FieldLabel>
                <FieldContent>
                  <Input
                    id="edit-symbol"
                    placeholder={asset?.type === "CRYPTO" ? "e.g. BTC, ETH" : "e.g. BBCA, GOTO"}
                    {...editForm.register("symbol")}
                    aria-invalid={!!editForm.formState.errors.symbol}
                  />
                  <FieldError
                    errors={
                      editForm.formState.errors.symbol
                        ? [editForm.formState.errors.symbol]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="edit-notes">Notes (optional)</FieldLabel>
              <FieldContent>
                <Input id="edit-notes" placeholder="e.g. Main savings bank account, etc." {...editForm.register("notes")} />
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
