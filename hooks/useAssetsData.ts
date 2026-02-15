"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Asset } from "@/lib/api/types";
import type { CreateAssetFormValues, UpdateAssetFormValues } from "@/lib/validations/asset";
import { createAsset, deleteAsset, updateAsset } from "@/lib/api/assets";
import { assetsQueryKey, assetsQueryOptions } from "@/lib/queries/assets";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { toast } from "sonner";

export interface UseAssetsDataResult {
  assets: Asset[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createMutation: ReturnType<typeof useMutation<Asset, Error, CreateAssetFormValues>>;
  updateMutation: ReturnType<typeof useMutation<Asset, Error, { uuid: string; data: UpdateAssetFormValues }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
}

export function useAssetsData(): UseAssetsDataResult {
  const queryClient = useQueryClient();
  const { data: assets = [], isLoading, isError, error } = useQuery(assetsQueryOptions());

  const createMutation = useMutation({
    mutationFn: (body: CreateAssetFormValues) => {
      const purchaseDate =
        body.purchaseDate?.includes("T")
          ? body.purchaseDate
          : body.purchaseDate
            ? `${body.purchaseDate.trim()}T00:00:00.000Z`
            : new Date().toISOString();
      return createAsset({
        name: body.name,
        type: body.type,
        quantity: body.quantity,
        purchasePrice: body.purchasePrice,
        purchaseDate,
        purchaseCurrency: body.purchaseCurrency,
        totalCost: body.totalCost ?? body.purchasePrice * body.quantity,
        ...(body.symbol?.trim() && { symbol: body.symbol.trim() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Asset added");
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
      invalidateOverviewQueries(queryClient);
      toast.success("Asset updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update asset");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteAsset(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Asset deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete asset");
    },
  });

  return {
    assets,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
