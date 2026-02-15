import { queryOptions } from "@tanstack/react-query";
import * as savingGoalsApi from "@/lib/api/saving-goals";

export const savingGoalsQueryKey = ["saving-goals"] as const;

export function savingGoalsQueryOptions() {
  return queryOptions({
    queryKey: savingGoalsQueryKey,
    queryFn: () => savingGoalsApi.listSavingGoals(),
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
