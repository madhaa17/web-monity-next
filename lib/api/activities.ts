import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

/**
 * Query params for GET /activities (see Postman: Activities).
 * - group_by: group results by day, month, or year.
 * - date: empty | "today" | YYYY-MM-DD; for "today" from device prefer sending actual date (YYYY-MM-DD).
 * - tz: optional IANA timezone (e.g. Asia/Jakarta); affects "today" and grouping.
 * For "this month" list: use date = first day of month (YYYY-MM-01) with group_by=month;
 * or call with group_by=month and pick the current month group from the response.
 */
export interface ActivitiesParams {
  group_by?: "day" | "week" | "month";
  date?: string;
  tz?: string;
}

/** Params to fetch activities for the current month (income/expense list this month). */
export function getActivitiesThisMonthParams(tz?: string): ActivitiesParams {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const params: ActivitiesParams = { group_by: "month", date };
  if (tz) params.tz = tz;
  return params;
}

/** Params to fetch activities for today (income + expense for "Recent activity" card). */
export function getActivitiesTodayParams(tz?: string): ActivitiesParams {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const params: ActivitiesParams = { group_by: "day", date };
  if (tz) params.tz = tz;
  return params;
}

export interface ActivityItem {
  [key: string]: unknown;
}

function buildQuery(params?: ActivitiesParams): string {
  if (!params || Object.keys(params).length === 0) return "";
  const search = new URLSearchParams();
  if (params.group_by) search.set("group_by", params.group_by);
  if (params.date) search.set("date", params.date);
  if (params.tz) search.set("tz", params.tz);
  const q = search.toString();
  return q ? `?${q}` : "";
}

/** Backend response when group_by is used: data.groups[].key, data.groups[].items */
interface ActivitiesGroupedResponse {
  data?: {
    groups?: Array<{ key?: string; items?: ActivityItem[] }>;
  };
}

export async function listActivities(
  params?: ActivitiesParams
): Promise<ActivityItem[]> {
  const path = `/activities${buildQuery(params)}`;
  const res = await apiClient<
    ApiResponse<ActivityItem[]> & ActivitiesGroupedResponse
  >(path);
  const data = res.data ?? (res as unknown as Record<string, unknown>);
  if (data && typeof data === "object" && Array.isArray((data as { groups?: unknown }).groups)) {
    const groups = (data as { groups: Array<{ items?: ActivityItem[] }> }).groups;
    return groups.flatMap((g) => g.items ?? []);
  }
  return Array.isArray(data) ? data : [];
}
