import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  PriceChartPoint,
  PriceChartSeries,
  PriceQuote,
  SymbolSearchResult,
} from "@/lib/api/types";
import { toNumber } from "@/lib/format";

/** Crypto chart: backend whitelist days = 1, 7, 14, 30, 90, 180, 365 (default 7). Hanya kirim days (+ currency). */
export interface CryptoChartParams {
  currency?: string;
  days?: number;
}

/** Stock chart: range (1d, 5d, 1mo, 3mo, 6mo, 1y, …) + interval (1d, 1wk, 1mo). Default range=1mo, interval=1d. Hindari range panjang (2y, 5y, 10y, max) dengan interval=1d. */
export interface StockChartParams {
  currency?: string;
  range?: string;
  interval?: string;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params || Object.keys(params).length === 0) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

/** Normalize API chart response to PriceChartPoint[]. Backend may use t (Unix ts), p (price), or time/timestamp/date, price/value/close. */
function normalizeChartData(raw: unknown): PriceChartPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (item == null || typeof item !== "object") return { time: "", price: 0 };
    const o = item as Record<string, unknown>;
    let time = "";
    const t = o.t ?? o.timestamp;
    if (typeof t === "number" && !Number.isNaN(t)) {
      time = new Date(t * 1000).toISOString();
    } else if (typeof o.time === "string") {
      time = o.time;
    } else if (typeof t === "string") {
      time = t;
    } else if (typeof o.date === "string") {
      time = o.date;
    }
    const price = toNumber(o.p ?? o.price ?? o.value ?? o.close);
    return { time, price };
  }).filter((p) => p.time && p.price > 0);
}

export type PricedAssetType = "CRYPTO" | "STOCK";

/** Search tickers for the symbol picker (Yahoo for stocks, CoinGecko for crypto). */
export async function searchSymbols(
  type: PricedAssetType,
  q: string
): Promise<SymbolSearchResult[]> {
  const res = await apiClient<ApiResponse<SymbolSearchResult[]>>(
    `/prices/search${buildQuery({ type, q })}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

/** Current price per unit of a symbol, converted to currency (default IDR). */
export async function getPriceQuote(
  type: PricedAssetType,
  symbol: string,
  currency = "IDR"
): Promise<PriceQuote> {
  const path = `/prices/${type === "CRYPTO" ? "crypto" : "stock"}/${encodeURIComponent(symbol)}${buildQuery({ currency })}`;
  const res = await apiClient<ApiResponse<PriceQuote>>(path);
  return { ...res.data, price: toNumber(res.data.price) };
}

export async function getCryptoChart(
  symbol: string,
  params?: CryptoChartParams
): Promise<PriceChartSeries> {
  const query = buildQuery(params as Record<string, string | number | undefined>);
  const path = `/prices/crypto/${encodeURIComponent(symbol)}/chart${query}`;
  const res = await apiClient<ApiResponse<unknown>>(path);
  return toChartSeries(res.data);
}

export async function getStockChart(
  symbol: string,
  params?: StockChartParams
): Promise<PriceChartSeries> {
  const query = buildQuery(params as Record<string, string | number | undefined>);
  const path = `/prices/stock/${encodeURIComponent(symbol)}/chart${query}`;
  const res = await apiClient<ApiResponse<unknown>>(path);
  return toChartSeries(res.data);
}

/** Read points and currency from a chart response ({ symbol, currency, data: [] } or a bare array). */
function toChartSeries(raw: unknown): PriceChartSeries {
  const currency =
    raw && typeof raw === "object" && "currency" in raw && typeof raw.currency === "string" && raw.currency
      ? raw.currency.toUpperCase()
      : undefined;
  return { currency, points: normalizeChartData(extractChartArray(raw)) };
}

/** Extract chart series from API: either data is array or data.data is array (e.g. { symbol, currency, data: [] }). */
function extractChartArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "data" in raw) {
    const inner = (raw as { data: unknown }).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}
