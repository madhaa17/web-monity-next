import { queryOptions } from "@tanstack/react-query";
import * as activitiesApi from "@/lib/api/activities";
import type { ActivitiesParams } from "@/lib/api/activities";

export function activitiesQueryKey(params?: ActivitiesParams) {
  return ["activities", params ?? {}] as const;
}

export function activitiesQueryOptions(params?: ActivitiesParams) {
  return queryOptions({
    queryKey: activitiesQueryKey(params),
    queryFn: () => activitiesApi.listActivities(params),
  });
}
