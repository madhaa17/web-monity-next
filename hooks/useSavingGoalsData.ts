"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { ListMeta, SavingGoal } from "@/lib/api/types";
import type {
  CreateSavingGoalFormValues,
  UpdateSavingGoalFormValues,
} from "@/lib/validations/saving-goal";
import {
  createSavingGoal,
  deleteSavingGoal,
  updateSavingGoal,
} from "@/lib/api/saving-goals";
import { savingGoalsQueryKey, savingGoalsQueryOptions } from "@/lib/queries/saving-goals";
import { invalidateOverviewQueries } from "@/lib/queries/overview";
import { buildListSearchParams, getListParamsFromSearchParams } from "@/lib/url-list-params";
import { toast } from "sonner";

export interface UseSavingGoalsDataResult {
  goals: SavingGoal[];
  meta: ListMeta | undefined;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createMutation: ReturnType<typeof useMutation<SavingGoal, Error, CreateSavingGoalFormValues>>;
  updateMutation: ReturnType<typeof useMutation<SavingGoal, Error, { uuid: string; data: UpdateSavingGoalFormValues }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
}

export function useSavingGoalsData(): UseSavingGoalsDataResult {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { page, limit } = getListParamsFromSearchParams(searchParams);
  const listParams = { page, limit };
  const { data, isLoading, isError, error } = useQuery(savingGoalsQueryOptions(listParams));
  const goals = data?.items ?? [];
  const meta = data?.meta;

  const setPage = useCallback(
    (p: number) => {
      router.replace(
        `${pathname}?${buildListSearchParams({ page: p, limit, month: undefined, year: undefined })}`
      );
    },
    [pathname, router, limit]
  );

  const setLimit = useCallback(
    (l: number) => {
      router.replace(
        `${pathname}?${buildListSearchParams({ page: 1, limit: l, month: undefined, year: undefined })}`
      );
    },
    [pathname, router]
  );

  const createMutation = useMutation({
    mutationFn: (body: CreateSavingGoalFormValues) => {
      const targetAmount = Number(body.targetAmount);
      const currentAmount = Number(body.currentAmount);
      if (!Number.isFinite(targetAmount) || targetAmount < 0.01)
        throw new Error("Target amount must be greater than 0");
      if (!Number.isFinite(currentAmount) || currentAmount < 0)
        throw new Error("Current amount cannot be negative");
      const payload: Parameters<typeof createSavingGoal>[0] = {
        title: body.title.trim(),
        targetAmount,
        currentAmount,
      };
      if (body.deadline?.trim()) {
        const d = body.deadline.trim();
        payload.deadline = d.includes("T") ? d : `${d}T00:00:00.000Z`;
      }
      return createSavingGoal(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingGoalsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Saving goal added");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to add saving goal"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: UpdateSavingGoalFormValues;
    }) => {
      const body: Record<string, unknown> = {};
      if (data.title !== undefined) body.title = data.title.trim();
      if (data.targetAmount !== undefined && Number.isFinite(Number(data.targetAmount)))
        body.targetAmount = Number(data.targetAmount);
      if (data.currentAmount !== undefined && Number.isFinite(Number(data.currentAmount)))
        body.currentAmount = Number(data.currentAmount);
      if (data.deadline !== undefined) {
        const d = data.deadline?.trim();
        if (d) body.deadline = d.includes("T") ? d : `${d}T00:00:00.000Z`;
      }
      return updateSavingGoal(uuid, body as Partial<Pick<SavingGoal, "title" | "targetAmount" | "currentAmount" | "deadline">>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingGoalsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Saving goal updated");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update saving goal"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteSavingGoal(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingGoalsQueryKey });
      invalidateOverviewQueries(queryClient);
      toast.success("Saving goal deleted");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete saving goal"
      );
    },
  });

  return {
    goals,
    meta,
    page,
    setPage,
    limit,
    setLimit,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
