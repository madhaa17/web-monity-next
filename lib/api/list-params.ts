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

export function buildListQuery(params?: ListDateFilterParams): string {
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
