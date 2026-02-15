"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AssetFormDialog } from "@/components/dashboard/assets/AssetFormDialog";
import { AssetList } from "@/components/dashboard/assets/AssetList";
import { createAsset, deleteAsset, updateAsset } from "@/lib/api/assets";
import { assetsQueryKey, assetsQueryOptions } from "@/lib/queries/assets";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Asset } from "@/lib/api/types";
import type { CreateAssetFormValues, UpdateAssetFormValues } from "@/lib/validations/asset";
import { Plus } from "lucide-react";

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: assets = [], isLoading, isError, error } = useQuery(assetsQueryOptions());

  const createMutation = useMutation({
    mutationFn: (body: CreateAssetFormValues) =>
      createAsset({
        name: body.name,
        type: body.type,
        quantity: body.quantity,
        purchasePrice: body.purchasePrice,
        purchaseDate: body.purchaseDate,
        purchaseCurrency: body.purchaseCurrency,
        totalCost: body.totalCost || body.purchasePrice * body.quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsQueryKey });
      toast.success("Asset added");
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add asset");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateAssetFormValues }) =>
      updateAsset(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsQueryKey });
      toast.success("Asset updated");
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update asset");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteAsset(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsQueryKey });
      toast.success("Asset deleted");
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete asset");
    },
  });

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    await deleteMutation.mutateAsync(assetToDelete.uuid);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingAsset(null);
  };

  const handleCreate = async (data: CreateAssetFormValues) => {
    await createMutation.mutateAsync(data);
  };

  const handleEditSubmit = async (data: UpdateAssetFormValues) => {
    if (!editingAsset) return;
    await updateMutation.mutateAsync({ uuid: editingAsset.uuid, data });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assets</h1>
        <Button
          onClick={() => {
            setDialogMode("create");
            setEditingAsset(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add asset
        </Button>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load assets."}
        </p>
      )}

      <AssetList
        assets={assets}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AssetFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        mode={dialogMode}
        asset={editingAsset}
        onSubmitCreate={handleCreate}
        onSubmitEdit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setAssetToDelete(null);
        }}
        title={assetToDelete ? `Delete "${assetToDelete.name}"?` : "Delete asset?"}
        description="This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
