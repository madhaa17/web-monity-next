"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IncomeFormDialog } from "@/components/dashboard/incomes/IncomeFormDialog";
import { IncomeList } from "@/components/dashboard/incomes/IncomeList";
import { createIncome, deleteIncome, updateIncome } from "@/lib/api/incomes";
import { incomesQueryKey } from "@/lib/queries/incomes";
import { assetsQueryOptions } from "@/lib/queries/assets";
import { incomesQueryOptions } from "@/lib/queries/incomes";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Income } from "@/lib/api/types";
import type { CreateIncomeFormValues, UpdateIncomeFormValues } from "@/lib/validations/income";
import { Plus } from "lucide-react";

export default function IncomesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: incomes = [], isLoading, isError, error } = useQuery(incomesQueryOptions());
  const { data: assets = [] } = useQuery(assetsQueryOptions());
  const cashAssets = assets.filter((a) => a.type === "CASH");

  const createMutation = useMutation({
    mutationFn: (body: CreateIncomeFormValues) => {
      const dateStr = body.date.includes("T") ? body.date : `${body.date}T00:00:00.000Z`;
      const payload: Parameters<typeof createIncome>[0] = {
        assetUuid: body.assetUuid,
        amount: body.amount,
        date: dateStr,
      };
      if (body.source?.trim()) payload.source = body.source.trim();
      if (body.note?.trim()) payload.note = body.note.trim();
      return createIncome(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomesQueryKey });
      toast.success("Income added");
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add income");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateIncomeFormValues }) =>
      updateIncome(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomesQueryKey });
      toast.success("Income updated");
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update income");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteIncome(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomesQueryKey });
      toast.success("Income deleted");
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete income");
    },
  });

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (income: Income) => {
    setIncomeToDelete(income);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!incomeToDelete) return;
    await deleteMutation.mutateAsync(incomeToDelete.uuid);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingIncome(null);
  };

  const handleCreate = async (data: CreateIncomeFormValues) => {
    await createMutation.mutateAsync(data);
  };

  const handleEditSubmit = async (data: UpdateIncomeFormValues) => {
    if (!editingIncome) return;
    await updateMutation.mutateAsync({ uuid: editingIncome.uuid, data });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Incomes</h1>
        <Button
          onClick={() => {
            setDialogMode("create");
            setEditingIncome(null);
            setDialogOpen(true);
          }}
          disabled={cashAssets.length === 0}
        >
          <Plus className="size-4" />
          Add income
        </Button>
      </div>

      {cashAssets.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a CASH asset first to record incomes.
        </p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load incomes."}
        </p>
      )}

      <IncomeList
        incomes={incomes}
        assets={assets}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <IncomeFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        mode={dialogMode}
        income={editingIncome}
        cashAssets={cashAssets}
        onSubmitCreate={handleCreate}
        onSubmitEdit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setIncomeToDelete(null);
        }}
        title="Delete income?"
        description="This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
