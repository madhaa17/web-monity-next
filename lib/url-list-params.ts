const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface ListParamsFromUrl {
  page: number;
  limit: number;
  month: string | undefined;
  year: string | undefined;
}

/** Readonly interface compatible with Next.js useSearchParams() and URLSearchParams */
export type ReadonlySearchParams = {
  get(name: string): string | null;
};

/**
 * Parse list filter/pagination params from URL search params.
 * Invalid or missing values fall back to defaults (page=1, limit=20, month/year undefined).
 */
export function getListParamsFromSearchParams(
  searchParams: ReadonlySearchParams
): ListParamsFromUrl {
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");
  const page = Math.max(1, parseInt(pageRaw ?? "", 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(limitRaw ?? "", 10) || DEFAULT_LIMIT);
  const month = searchParams.get("month") ?? undefined;
  const year = searchParams.get("year") ?? undefined;
  return { page, limit, month: month || undefined, year: year || undefined };
}

export interface BuildListSearchParamsInput {
  page: number;
  limit: number;
  month?: string | undefined;
  year?: string | undefined;
}

/**
 * Build URLSearchParams for list filter/pagination. Always includes page and limit.
 * Omits month/year when undefined.
 */
export function buildListSearchParams(params: BuildListSearchParamsInput): URLSearchParams {
  const q = new URLSearchParams();
  q.set("page", String(Math.max(1, params.page)));
  q.set("limit", String(Math.max(1, params.limit)));
  if (params.month != null && params.month !== "") q.set("month", params.month);
  if (params.year != null && params.year !== "") q.set("year", params.year);
  return q;
}
