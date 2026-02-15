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
 * Format number as IDR display string with dot as thousands separator (e.g. 1500000 -> "1.500.000").
 * No currency symbol; for use inside inputs with separate prefix.
 */
export function formatIdrDisplay(value: number): string {
  if (value === 0) return "0";
  if (!Number.isFinite(value) || Number.isNaN(value)) return "";
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse string from IDR input (dots as thousands separator) to number.
 * Strips dots and commas, then parses (e.g. "1.500.000" -> 1500000).
 */
export function parseIdrInput(str: string): number {
  const cleaned = str.replace(/\./g, "").replace(/,/g, "").trim();
  if (cleaned === "") return 0;
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
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
