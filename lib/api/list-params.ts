/**
 * Shared params for list endpoints that support date filter and pagination (incomes, expenses).
 * OpenAPI: page, limit, date_from, date_to, month, year.
 */
export interface ListDateFilterParams {
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
  month?: string;
  year?: string;
}

/** Sort order for income/expense lists */
export type TransactionSort = "-date" | "date" | "-amount" | "amount";

/** Filters shared by income/expense lists and their summaries. */
export interface TransactionFilterParams {
  date_from?: string;
  date_to?: string;
  month?: string;
  year?: string;
  /** Comma-separated category UUIDs */
  category?: string;
  /** Asset UUID */
  asset?: string;
  /** Searches note (and source for incomes) */
  q?: string;
  min_amount?: string;
  max_amount?: string;
}

export interface TransactionListParams extends TransactionFilterParams {
  page?: number;
  limit?: number;
  sort?: TransactionSort;
}

export function buildListQuery(params?: ListDateFilterParams | TransactionListParams): string {
  if (!params || Object.keys(params).length === 0) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

/** Build query string from any params object (e.g. debts/receivables: page, limit, status, due_from, due_to). */
export function buildQueryFromParams(
  params?: Record<string, string | number | undefined | null>
): string {
  if (!params || Object.keys(params).length === 0) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}
