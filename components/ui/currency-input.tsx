"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  formatIdrDecimalDisplay,
  formatIdrDisplay,
  parseIdrDecimalInput,
  parseIdrInput,
  typingIdrDecimal,
} from "@/lib/format";

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  /** Fraction digits the user may type after a comma (e.g. 8 for a sub-rupiah coin price). Default 0. */
  decimals?: number;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    { className, value, onChange, prefix = "IDR ", decimals = 0, id, disabled, "aria-invalid": ariaInvalid, ...props },
    ref
  ) => {
    const format = React.useCallback(
      (v: number) => (decimals > 0 ? formatIdrDecimalDisplay(v, decimals) : formatIdrDisplay(v)),
      [decimals]
    );
    const parse = React.useCallback(
      (s: string) => (decimals > 0 ? parseIdrDecimalInput(s) : parseIdrInput(s)),
      [decimals]
    );
    const [displayValue, setDisplayValue] = React.useState(() => format(value));
    const isControlled = value !== undefined && value !== null;

    React.useEffect(() => {
      // Only resync when the value changed from outside, so a half-typed "0," is not wiped.
      if (isControlled) {
        setDisplayValue((shown) => (parse(shown) === value ? shown : format(value)));
      }
    }, [value, isControlled, format, parse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (decimals > 0) {
        const shown = typingIdrDecimal(raw, decimals);
        setDisplayValue(shown);
        onChange(parseIdrDecimalInput(shown));
        return;
      }
      const num = parseIdrInput(raw);
      setDisplayValue(formatIdrDisplay(num));
      onChange(num);
    };

    return (
      <div
        aria-invalid={ariaInvalid}
        className={cn(
          "border-input flex h-9 w-full min-w-0 items-center rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
      >
        <span className="text-muted-foreground select-none pl-3 text-sm">
          {prefix}
        </span>
        <input
          ref={ref}
          type="text"
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          autoComplete="off"
          id={id}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "placeholder:text-muted-foreground border-0 bg-transparent px-2 py-1 text-base outline-none md:text-sm",
            "min-w-0 flex-1"
          )}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
