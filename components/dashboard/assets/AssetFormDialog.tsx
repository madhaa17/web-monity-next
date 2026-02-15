"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Asset } from "@/lib/api/types";
import type { AssetType } from "@/lib/api/types";
import { createAssetSchema, updateAssetSchema } from "@/lib/validations/asset";
import type { CreateAssetFormValues, UpdateAssetFormValues } from "@/lib/validations/asset";
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

const ASSET_TYPES: AssetType[] = [
  "CASH",
  "CRYPTO",
  "STOCK",
  "LIVESTOCK",
  "REAL_ESTATE",
  "OTHER",
];

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
    defaultValues: { name: "", quantity: 0, notes: "" },
  });

  useEffect(() => {
    if (open && asset && !isCreate) {
      editForm.reset({
        name: asset.name ?? "",
        quantity: toNumber(asset.quantity),
        notes: (asset.notes as string) ?? "",
      });
    }
  }, [open, asset, isCreate, editForm]);

  useEffect(() => {
    if (open && isCreate) {
      createForm.reset({
        name: "",
        type: "CASH",
        quantity: 0,
        purchasePrice: 0,
        purchaseDate: todayISO(),
        purchaseCurrency: "IDR",
        totalCost: 0,
        symbol: "",
        notes: "",
      });
    }
  }, [open, isCreate, createForm]);

  const handleCreate = createForm.handleSubmit(async (data) => {
    await onSubmitCreate({
      ...data,
      totalCost: data.totalCost || data.purchasePrice * data.quantity,
    });
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
                  {...createForm.register("name")}
                  aria-invalid={!!createForm.formState.errors.name}
                />
                <FieldError errors={createForm.formState.errors.name ? [createForm.formState.errors.name] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Type</FieldLabel>
              <FieldContent>
                <Select
                  value={createForm.watch("type")}
                  onValueChange={(v) => createForm.setValue("type", v as AssetType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
              <FieldContent>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  {...createForm.register("quantity", { valueAsNumber: true })}
                  aria-invalid={!!createForm.formState.errors.quantity}
                />
                <FieldError errors={createForm.formState.errors.quantity ? [createForm.formState.errors.quantity] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="purchasePrice">Purchase price</FieldLabel>
              <FieldContent>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="any"
                  {...createForm.register("purchasePrice", { valueAsNumber: true })}
                  aria-invalid={!!createForm.formState.errors.purchasePrice}
                />
                <FieldError errors={createForm.formState.errors.purchasePrice ? [createForm.formState.errors.purchasePrice] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="purchaseDate">Purchase date</FieldLabel>
              <FieldContent>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...createForm.register("purchaseDate")}
                  aria-invalid={!!createForm.formState.errors.purchaseDate}
                />
                <FieldError errors={createForm.formState.errors.purchaseDate ? [createForm.formState.errors.purchaseDate] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="purchaseCurrency">Currency</FieldLabel>
              <FieldContent>
                <Input
                  id="purchaseCurrency"
                  {...createForm.register("purchaseCurrency")}
                  aria-invalid={!!createForm.formState.errors.purchaseCurrency}
                />
                <FieldError errors={createForm.formState.errors.purchaseCurrency ? [createForm.formState.errors.purchaseCurrency] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="totalCost">Total cost</FieldLabel>
              <FieldContent>
                <Input
                  id="totalCost"
                  type="number"
                  step="any"
                  {...createForm.register("totalCost", { valueAsNumber: true })}
                  aria-invalid={!!createForm.formState.errors.totalCost}
                />
                <FieldError errors={createForm.formState.errors.totalCost ? [createForm.formState.errors.totalCost] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <FieldContent>
                <Input id="notes" {...createForm.register("notes")} />
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
                <FieldError errors={editForm.formState.errors.name ? [editForm.formState.errors.name] : undefined} />
              </FieldContent>
            </Field>
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
                <FieldError errors={editForm.formState.errors.quantity ? [editForm.formState.errors.quantity] : undefined} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-notes">Notes (optional)</FieldLabel>
              <FieldContent>
                <Input id="edit-notes" {...editForm.register("notes")} />
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
