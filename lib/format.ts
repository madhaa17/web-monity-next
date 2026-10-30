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
 * Format a per-unit market price. Unlike formatCurrency it keeps the significant decimals of small
 * prices (a coin at Rp 0,0799 would otherwise show as Rp 0).
 */
export function formatUnitPrice(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const abs = Math.abs(amount);
  const maximumFractionDigits =
    abs === 0 || abs >= 100 ? 0 : Math.min(8, 3 - Math.floor(Math.log10(abs)));
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(amount);
}

/** Format an asset quantity, keeping up to 8 decimals (crypto amounts such as 0,00012 BTC). */
export function formatQuantity(quantity: number): string {
  return quantity.toLocaleString("id-ID", { maximumFractionDigits: 8 });
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

/** Format for a decimal IDR input: dots group thousands, a comma starts the fraction (0,089166). */
export function formatIdrDecimalDisplay(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString("id-ID", { maximumFractionDigits: decimals });
}

/** Parse a decimal IDR input ("1.500,25" -> 1500.25). */
export function parseIdrDecimalInput(str: string): number {
  const cleaned = str.replace(/\./g, "").replace(",", ".").trim();
  if (cleaned === "" || cleaned === ".") return 0;
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Normalise text while it is typed into a decimal IDR input: regroup the whole part and keep the
 * fraction as typed (so "0," and "0,00" survive until the next digit). Dots are always thousands
 * separators, matching formatIdrDisplay.
 */
export function typingIdrDecimal(raw: string, decimals: number): string {
  const s = raw.replace(/[^\d.,]/g, "");
  const [wholeRaw, ...rest] = s.split(",");
  const whole = wholeRaw.replace(/\./g, "").replace(/^0+(?=\d)/, "");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (rest.length === 0) return grouped;
  const fraction = rest.join("").replace(/\./g, "").slice(0, decimals);
  return `${grouped || "0"},${fraction}`;
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
