"use client";

import type { Category } from "@/lib/api/types";
import { categoryColor } from "@/lib/category-color";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategoryDot({
  category,
  className,
}: {
  category: { color?: string | null; uuid?: string; name?: string };
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: categoryColor(category) }}
    />
  );
}

/** Category name with its color dot, for tables and lists. */
export function CategoryLabel({ uuid, name, color }: { uuid?: string; name: string; color?: string | null }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CategoryDot category={{ uuid, name, color }} />
      <span className="truncate">{name}</span>
    </span>
  );
}

export interface CategorySelectProps {
  categories: Category[];
  value: string | undefined;
  onValueChange: (uuid: string) => void;
  /** When set, adds a first option with this label that maps to the value "" (e.g. "All categories"). */
  allLabel?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
}

const ALL = "__all__";

export function CategorySelect({
  categories,
  value,
  onValueChange,
  allLabel,
  placeholder = "Select category",
  id,
  className,
  ...aria
}: CategorySelectProps) {
  return (
    <Select
      value={value || (allLabel ? ALL : "")}
      onValueChange={(v) => onValueChange(v === ALL ? "" : v)}
    >
      <SelectTrigger id={id} className={cn("w-full", className)} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {categories.map((c) => (
          <SelectItem key={c.uuid} value={c.uuid}>
            <CategoryLabel uuid={c.uuid} name={c.name} color={c.color} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
