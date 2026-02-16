"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface DateMonthYearFilterProps {
  month: string | undefined;
  year: string | undefined;
  onMonthChange: (month: string | undefined) => void;
  onYearChange: (year: string | undefined) => void;
  label?: string;
  className?: string;
}

export function DateMonthYearFilter({
  month,
  year,
  onMonthChange,
  onYearChange,
  label = "Period",
  className,
}: DateMonthYearFilterProps) {
  const hasFilter = month !== undefined || year !== undefined;

  const handleClear = () => {
    onMonthChange(undefined);
    onYearChange(undefined);
  };

  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="filter-month" className="text-muted-foreground text-sm shrink-0">
          {label}
        </Label>
        <Input
          id="filter-month"
          type="month"
          value={month ?? ""}
          onChange={(e) => onMonthChange(e.target.value || undefined)}
          className="h-8 w-[140px]"
          aria-label="Filter by month"
        />
        <Input
          id="filter-year"
          type="number"
          placeholder="Year"
          min={2000}
          max={2100}
          value={year ?? ""}
          onChange={(e) => {
            const v = e.target.value.trim();
            onYearChange(v === "" ? undefined : v);
          }}
          className="h-8 w-[80px]"
          aria-label="Filter by year"
        />
      </div>
      {hasFilter && (
        <Button type="button" variant="ghost" size="sm" className="h-8" onClick={handleClear}>
          All time
        </Button>
      )}
    </div>
  );
}
