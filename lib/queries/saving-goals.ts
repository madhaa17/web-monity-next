import { queryOptions } from "@tanstack/react-query";
import * as savingGoalsApi from "@/lib/api/saving-goals";
import type { ListSavingGoalsParams } from "@/lib/api/saving-goals";

export const savingGoalsQueryKey = ["saving-goals"] as const;

export function savingGoalsQueryKeyWithParams(params?: ListSavingGoalsParams) {
  return [...savingGoalsQueryKey, params ?? {}] as const;
}

export function savingGoalsQueryOptions(params?: ListSavingGoalsParams) {
  return queryOptions({
    queryKey: savingGoalsQueryKeyWithParams(params),
    queryFn: () => savingGoalsApi.listSavingGoals(params),
  });
}

export function savingGoalQueryKey(uuid: string) {
  return ["saving-goals", uuid] as const;
}

export function savingGoalQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: savingGoalQueryKey(uuid),
    queryFn: () => savingGoalsApi.getSavingGoal(uuid),
  });
}
