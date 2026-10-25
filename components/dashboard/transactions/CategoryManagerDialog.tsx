"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Category, CategoryType } from "@/lib/api/types";
import { CATEGORY_PALETTE, categoryColor } from "@/lib/category-color";
import { categoryFormSchema } from "@/lib/validations/transaction";
import { cn } from "@/lib/utils";
import { useCategoryMutations } from "@/hooks/useTransactionsData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CategoryDot, CategorySelect } from "@/components/dashboard/transactions/CategorySelect";

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" aria-label="Pick color">
          <span className="size-4 rounded-full" style={{ backgroundColor: value }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-5 gap-1.5">
          {CATEGORY_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={cn(
                "flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background",
                value.toUpperCase() === c && "ring-2 ring-ring"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
              aria-pressed={value.toUpperCase() === c}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Name + color inputs shared by the "add" row and the inline edit row. */
function CategoryEditor({
  initialName = "",
  initialColor,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  initialColor: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: { name: string; color: string }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = categoryFormSchema.safeParse({ name, color });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid category");
      return;
    }
    setError(null);
    try {
      await onSubmit({ name: parsed.data.name, color });
      setName("");
    } catch {
      // The mutation already shows the server's message as a toast; keep the input for a retry.
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <ColorPicker value={color} onChange={setColor} />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          maxLength={50}
          aria-label="Category name"
          aria-invalid={!!error}
          autoFocus={!!onCancel}
        />
        <Button type="submit" size={onCancel ? "icon" : "default"} disabled={isPending} aria-label={submitLabel}>
          {onCancel ? <Check className="size-4" /> : (
            <>
              <Plus className="size-4" />
              {submitLabel}
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Cancel">
            <X className="size-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </form>
  );
}

export interface CategoryManagerDialogProps {
  type: CategoryType;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RowMode = { uuid: string; mode: "edit" | "delete" } | null;

export function CategoryManagerDialog({ type, categories, open, onOpenChange }: CategoryManagerDialogProps) {
  const { createMutation, updateMutation, deleteMutation } = useCategoryMutations(type);
  const [row, setRow] = useState<RowMode>(null);
  const [reassignTo, setReassignTo] = useState("");
  const label = type === "INCOME" ? "Income" : "Expense";

  const startDelete = (category: Category) => {
    // Transactions of the deleted category move here; prefer "Other" when it is not the one being deleted.
    const others = categories.filter((c) => c.uuid !== category.uuid);
    const fallback = others.find((c) => c.name.toLowerCase() === "other") ?? others[0];
    setReassignTo(fallback?.uuid ?? "");
    setRow({ uuid: category.uuid, mode: "delete" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setRow(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{label} categories</DialogTitle>
          <DialogDescription>
            Rename, recolor or remove categories. Changes apply to all existing {label.toLowerCase()}s.
          </DialogDescription>
        </DialogHeader>

        <CategoryEditor
          key={`add-${categories.length}`}
          initialColor={CATEGORY_PALETTE[categories.length % CATEGORY_PALETTE.length]}
          submitLabel="Add"
          isPending={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />

        <ul className="-mx-2 max-h-[50vh] divide-y overflow-y-auto">
          {categories.map((category) => {
            const mode = row?.uuid === category.uuid ? row.mode : null;
            if (mode === "edit") {
              return (
                <li key={category.uuid} className="px-2 py-2">
                  <CategoryEditor
                    initialName={category.name}
                    initialColor={categoryColor(category)}
                    submitLabel="Save"
                    isPending={updateMutation.isPending}
                    onCancel={() => setRow(null)}
                    onSubmit={async (values) => {
                      await updateMutation.mutateAsync({ uuid: category.uuid, body: values });
                      setRow(null);
                    }}
                  />
                </li>
              );
            }
            if (mode === "delete") {
              const targets = categories.filter((c) => c.uuid !== category.uuid);
              return (
                <li key={category.uuid} className="bg-destructive/5 flex flex-col gap-2 px-2 py-3">
                  <p className="text-sm">
                    Delete <span className="font-medium">{category.name}</span>? Its {label.toLowerCase()}s will move
                    to:
                  </p>
                  <div className="flex items-center gap-2">
                    <CategorySelect
                      categories={targets}
                      value={reassignTo}
                      onValueChange={setReassignTo}
                      aria-label="Move transactions to"
                    />
                    <Button
                      variant="destructive"
                      disabled={!reassignTo || deleteMutation.isPending}
                      onClick={() =>
                        deleteMutation.mutate({ uuid: category.uuid, reassignTo }, { onSuccess: () => setRow(null) })
                      }
                    >
                      {deleteMutation.isPending ? "Deleting…" : "Delete"}
                    </Button>
                    <Button variant="ghost" onClick={() => setRow(null)}>
                      Cancel
                    </Button>
                  </div>
                </li>
              );
            }
            return (
              <li key={category.uuid} className="flex items-center gap-3 px-2 py-1.5">
                <CategoryDot category={category} className="size-3" />
                <span className="min-w-0 flex-1 truncate text-sm">{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setRow({ uuid: category.uuid, mode: "edit" })}
                  aria-label={`Edit ${category.name}`}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive size-8"
                  onClick={() => startDelete(category)}
                  disabled={categories.length <= 1}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
