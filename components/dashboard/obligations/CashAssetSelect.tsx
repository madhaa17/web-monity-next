"use client";

import type { Asset } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "__none__";

export interface CashAssetSelectProps {
  id?: string;
  cashAssets: Asset[];
  /** Asset UUID, or "" for none. */
  value: string;
  onChange: (value: string) => void;
}

/** Optional CASH asset picker; "No cash movement" keeps the entry as a plain record. */
export function CashAssetSelect({ id, cashAssets, value, onChange }: CashAssetSelectProps) {
  return (
    <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No cash movement</SelectItem>
        {cashAssets.map((a) => (
          <SelectItem key={a.uuid} value={a.uuid}>
            {a.name} · {formatCurrency(toNumber(a.quantity))}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
