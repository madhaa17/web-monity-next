"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AssetFormDialog } from "@/components/dashboard/assets/AssetFormDialog";
import { AssetList } from "@/components/dashboard/assets/AssetList";
import type { Asset } from "@/lib/api/types";
import type { CreateAssetFormValues, UpdateAssetFormValues } from "@/lib/validations/asset";
import { Plus } from "lucide-react";

export interface AssetsContentProps {
  assets: Asset[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingAsset: Asset | null;
  assetToDelete: Asset | null;
  deleteDialogOpen: boolean;
  onAddClick: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onDialogOpenChange: (open: boolean) => void;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onCreate: (data: CreateAssetFormValues) => Promise<void>;
  onEditSubmit: (data: UpdateAssetFormValues) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  isSubmitting: boolean;
  isDeleting: boolean;
}

export function AssetsContent({
  assets,
  isLoading,
  isError,
  error,
  dialogOpen,
  dialogMode,
  editingAsset,
  assetToDelete,
  deleteDialogOpen,
  onAddClick,
  onEdit,
  onDelete,
  onDialogOpenChange,
  onDeleteDialogOpenChange,
  onCreate,
  onEditSubmit,
  onConfirmDelete,
  isSubmitting,
  isDeleting,
}: AssetsContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assets</h1>
        <Button onClick={onAddClick}>
          <Plus className="size-4" />
          Add asset
        </Button>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message ?? "Failed to load assets."}
        </p>
      )}

      <AssetList
        assets={assets}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <AssetFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        mode={dialogMode}
        asset={editingAsset}
        onSubmitCreate={onCreate}
        onSubmitEdit={onEditSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title={assetToDelete ? `Delete "${assetToDelete.name}"?` : "Delete asset?"}
        description="This action cannot be undone."
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
