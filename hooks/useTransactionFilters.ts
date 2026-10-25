"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TransactionListParams, TransactionSort } from "@/lib/api/list-params";

const DEFAULT_LIMIT = 20;
const SORTS: TransactionSort[] = ["-date", "date", "-amount", "amount"];

/** Filter keys stored in the URL, in the order they are written. */
const FILTER_KEYS = ["month", "year", "category", "asset", "q", "sort"] as const;

export type TransactionFilterState = {
  page: number;
  limit: number;
  month?: string;
  year?: string;
  category?: string;
  asset?: string;
  q?: string;
  sort: TransactionSort;
};

export interface UseTransactionFiltersResult {
  filters: TransactionFilterState;
  /** Params for the list endpoint (includes page, limit and sort) */
  listParams: TransactionListParams;
  /** Params for the summary endpoint (filters only) */
  summaryParams: Omit<TransactionListParams, "page" | "limit" | "sort">;
  /** True when anything narrows the list (period, category, asset or search) */
  isFiltered: boolean;
  /** Updates filters in the URL; any change other than page resets to page 1. */
  setFilters: (patch: Partial<TransactionFilterState>) => void;
  clearFilters: () => void;
}

function optional(value: string | null): string | undefined {
  return value ? value : undefined;
}

/** Income/expense list filters, kept in the URL so they survive reloads and can be shared. */
export function useTransactionFilters(): UseTransactionFiltersResult {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const sortRaw = searchParams.get("sort") as TransactionSort | null;
  const filters: TransactionFilterState = {
    page: Math.max(1, parseInt(searchParams.get("page") ?? "", 10) || 1),
    limit: Math.max(1, parseInt(searchParams.get("limit") ?? "", 10) || DEFAULT_LIMIT),
    month: optional(searchParams.get("month")),
    year: optional(searchParams.get("year")),
    category: optional(searchParams.get("category")),
    asset: optional(searchParams.get("asset")),
    q: optional(searchParams.get("q")),
    sort: sortRaw && SORTS.includes(sortRaw) ? sortRaw : "-date",
  };

  // Several setFilters calls in one event (e.g. clearing month and year) must build on each
  // other rather than on the stale URL, so the latest unflushed state is kept here.
  const pending = useRef<TransactionFilterState | null>(null);

  const write = (next: TransactionFilterState) => {
    pending.current = next;
    queueMicrotask(() => {
      pending.current = null;
    });
    const q = new URLSearchParams();
    q.set("page", String(next.page));
    q.set("limit", String(next.limit));
    for (const key of FILTER_KEYS) {
      const value = next[key];
      if (value && !(key === "sort" && value === "-date")) q.set(key, value);
    }
    router.replace(`${pathname}?${q.toString()}`);
  };

  const setFilters = (patch: Partial<TransactionFilterState>) => {
    const base = pending.current ?? filters;
    const resetsPage = Object.keys(patch).some((k) => k !== "page");
    write({ ...base, ...patch, page: resetsPage ? 1 : (patch.page ?? base.page) });
  };

  const clearFilters = () => {
    write({ page: 1, limit: filters.limit, sort: filters.sort });
  };

  const summaryParams = {
    month: filters.month,
    year: filters.year,
    category: filters.category,
    asset: filters.asset,
    q: filters.q,
  };

  return {
    filters,
    listParams: { ...summaryParams, page: filters.page, limit: filters.limit, sort: filters.sort },
    summaryParams,
    isFiltered: Object.values(summaryParams).some(Boolean),
    setFilters,
    clearFilters,
  };
}
