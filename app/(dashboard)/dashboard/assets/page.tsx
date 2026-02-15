"use client";

import { useState } from "react";
import type { Asset } from "@/lib/api/types";
import type { CreateAssetFormValues, UpdateAssetFormValues } from "@/lib/validations/asset";
import { useAssetsData } from "@/hooks/useAssetsData";
import { AssetsContent } from "@/components/dashboard/assets/AssetsContent";

export default function AssetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    assets,
    isLoading,
    isError,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAssetsData();

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setDialogMode("create");
    setEditingAsset(null);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingAsset(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setAssetToDelete(null);
  };

  const handleCreate = async (data: CreateAssetFormValues) => {
    await createMutation.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (data: UpdateAssetFormValues) => {
    if (!editingAsset) return;
    await updateMutation.mutateAsync({ uuid: editingAsset.uuid, data });
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    await deleteMutation.mutateAsync(assetToDelete.uuid);
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  return (
    <AssetsContent
      assets={assets}
      isLoading={isLoading}
      isError={isError}
      error={error}
      dialogOpen={dialogOpen}
      dialogMode={dialogMode}
      editingAsset={editingAsset}
      assetToDelete={assetToDelete}
      deleteDialogOpen={deleteDialogOpen}
      onAddClick={handleAddClick}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDialogOpenChange={handleDialogOpenChange}
      onDeleteDialogOpenChange={handleDeleteDialogOpenChange}
      onCreate={handleCreate}
      onEditSubmit={handleEditSubmit}
      onConfirmDelete={handleConfirmDelete}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
}
