const DEFAULT_CURRENCY = "IDR";

/**
 * Coerce API value (string or number) to number. Use when backend returns numeric fields as strings.
 */
export function toNumber(x: unknown): number {
  if (typeof x === "number" && !Number.isNaN(x)) return x;
  if (typeof x === "string") {
    const n = parseFloat(x);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

/**
 * Format a number as currency. Uses Intl.NumberFormat.
 * @param amount - Value to format
 * @param currency - ISO currency code (default IDR)
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string for display (e.g. API date to locale date).
 * @param dateStr - ISO or date string from API
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}
