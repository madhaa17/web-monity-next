"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import type { Asset, Category } from "@/lib/api/types";
import type { TransactionSort } from "@/lib/api/list-params";
import type { TransactionFilterState } from "@/hooks/useTransactionFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateMonthYearFilter } from "@/components/dashboard/DateMonthYearFilter";
import { CategorySelect } from "@/components/dashboard/transactions/CategorySelect";

const SEARCH_DEBOUNCE_MS = 300;
const ALL_ASSETS = "__all__";

const SORT_LABELS: Record<TransactionSort, string> = {
  "-date": "Newest first",
  date: "Oldest first",
  "-amount": "Largest amount",
  amount: "Smallest amount",
};

export interface TransactionFiltersProps {
  filters: TransactionFilterState;
  setFilters: (patch: Partial<TransactionFilterState>) => void;
  clearFilters: () => void;
  isFiltered: boolean;
  categories: Category[];
  cashAssets: Asset[];
  searchPlaceholder: string;
}

export function TransactionFilters({
  filters,
  setFilters,
  clearFilters,
  isFiltered,
  categories,
  cashAssets,
  searchPlaceholder,
}: TransactionFiltersProps) {
  // The search box is edited locally and written to the URL after a pause in typing.
  const [search, setSearch] = useState(filters.q ?? "");
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    // The URL changed elsewhere (e.g. "Clear filters"): follow it.
    setSyncedQ(filters.q);
    setSearch(filters.q ?? "");
  }

  useEffect(() => {
    const next = search.trim() || undefined;
    if (next === filters.q) return;
    const timer = setTimeout(() => setFilters({ q: next }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, filters.q, setFilters]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
            aria-label="Search"
            maxLength={100}
          />
        </div>
        <CategorySelect
          categories={categories}
          value={filters.category}
          onValueChange={(v) => setFilters({ category: v || undefined })}
          allLabel="All categories"
          aria-label="Filter by category"
        />
        <Select
          value={filters.asset ?? ALL_ASSETS}
          onValueChange={(v) => setFilters({ asset: v === ALL_ASSETS ? undefined : v })}
        >
          <SelectTrigger className="w-full" aria-label="Filter by asset">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ASSETS}>All cash assets</SelectItem>
            {cashAssets.map((a) => (
              <SelectItem key={a.uuid} value={a.uuid}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v as TransactionSort })}>
          <SelectTrigger className="w-full" aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as TransactionSort[]).map((s) => (
              <SelectItem key={s} value={s}>
                {SORT_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <DateMonthYearFilter
          month={filters.month}
          year={filters.year}
          onMonthChange={(month) => setFilters({ month })}
          onYearChange={(year) => setFilters({ year })}
        />
        {isFiltered && (
          <Button type="button" variant="ghost" size="sm" className="h-8" onClick={clearFilters}>
            <X className="size-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
