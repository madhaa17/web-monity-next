"use client";

import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import type { PricedAssetType } from "@/lib/api/prices";
import type { SymbolSearchResult } from "@/lib/api/types";
import { symbolSearchQueryOptions } from "@/lib/queries/prices";
import { useDebounced } from "@/hooks/useDebounced";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SymbolPickerProps {
  id?: string;
  type: PricedAssetType;
  /** The stored symbol (e.g. BBCA.JK). */
  value: string;
  /** Called with the typed text (result null) or the picked search result. */
  onChange: (symbol: string, result: SymbolSearchResult | null) => void;
  invalid?: boolean;
}

function resultDetail(r: SymbolSearchResult): string {
  if (r.kind === "COIN") return r.rank ? `Rank #${r.rank}` : "Unranked";
  return [r.exchange, r.kind === "ETF" ? "ETF" : null].filter(Boolean).join(" · ");
}

/**
 * Ticker input with search suggestions, so the user picks the exact instrument (BBCA.JK on the
 * Jakarta exchange rather than the US ETF BBCA) instead of guessing the ticker format.
 */
export function SymbolPicker({ id, type, value, onChange, invalid }: SymbolPickerProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const query = useDebounced(value, 300);
  const { data: results = [], isFetching, isError } = useQuery(
    symbolSearchQueryOptions(type, query)
  );
  const showList = open && value.trim().length > 0;
  // Results belong to the text in the box only once the debounce has caught up.
  const settled = query === value && !isFetching;

  const pick = (r: SymbolSearchResult) => {
    onChange(r.symbol, r);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        id={id}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-invalid={invalid}
        className="pl-9 uppercase placeholder:normal-case"
        placeholder={
          type === "CRYPTO" ? "Search coin, e.g. BTC or Solana" : "Search stock, e.g. BBCA or Apple"
        }
        onChange={(e) => {
          onChange(e.target.value.toUpperCase(), null);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          // Enter in this box picks a result; it must never submit the surrounding form.
          if (e.key === "Enter") e.preventDefault();
          if (!showList || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            if (settled) pick(results[Math.min(active, results.length - 1)]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border p-1 shadow-md"
        >
          {isFetching && results.length === 0 ? (
            <li className="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-sm">
              <Loader2 className="size-3.5 animate-spin" /> Searching…
            </li>
          ) : isError ? (
            <li className="text-muted-foreground px-2 py-1.5 text-sm">
              Search is unavailable. You can still type the exact ticker.
            </li>
          ) : results.length === 0 ? (
            <li className="text-muted-foreground px-2 py-1.5 text-sm">No match found.</li>
          ) : (
            results.map((r, i) => (
              <li
                key={`${r.symbol}-${r.coinId ?? r.exchange ?? i}`}
                role="option"
                aria-selected={i === active}
                // mousedown fires before the input's blur closes the list
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(r);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-sm",
                  i === active && "bg-accent text-accent-foreground"
                )}
              >
                <span className="min-w-0">
                  <span className="font-medium">{r.symbol}</span>
                  <span className="text-muted-foreground block truncate text-xs">{r.name}</span>
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">{resultDetail(r)}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
