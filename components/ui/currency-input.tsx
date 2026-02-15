"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatIdrDisplay, parseIdrInput } from "@/lib/format";

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    { className, value, onChange, prefix = "IDR ", id, disabled, "aria-invalid": ariaInvalid, ...props },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      formatIdrDisplay(value)
    );
    const isControlled = value !== undefined && value !== null;

    React.useEffect(() => {
      if (isControlled) {
        const formatted = formatIdrDisplay(value);
        setDisplayValue(formatted);
      }
    }, [value, isControlled]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
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
          inputMode="numeric"
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
