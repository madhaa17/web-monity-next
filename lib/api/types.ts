/** API response wrapper (Postman: most endpoints return { data: T }) */
export interface ApiResponse<T> {
  data: T;
}

/** List response meta (paginated endpoints) */
export interface ListMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

/** List response shape: data is { items, meta } */
export interface ListResponse<T> {
  items: T[];
  meta?: ListMeta;
}

/** Auth: login/register return token + refreshToken (camelCase per OpenAPI) */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user?: User;
}

/** Current user (GET /auth/me) */
export interface User {
  uuid?: string;
  email?: string;
  name?: string;
}

/** Asset types from API */
export type AssetType =
  | "CASH"
  | "CRYPTO"
  | "STOCK"
  | "LIVESTOCK"
  | "REAL_ESTATE"
  | "OTHER";

export type AssetStatus = "ACTIVE" | "SOLD" | "PLANNED";

export interface Asset {
  uuid: string;
  name: string;
  type: AssetType;
  quantity?: number;
  symbol?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  purchaseCurrency?: string;
  totalCost?: number;
  description?: string;
  notes?: string;
  status?: AssetStatus;
  [key: string]: unknown;
}

/** Income and expense records share most fields; "kind" selects the API resource. */
export type TransactionKind = "income" | "expense";

export type CategoryType = "INCOME" | "EXPENSE";

/** User-defined income or expense category (GET /categories) */
export interface Category {
  uuid: string;
  type: CategoryType;
  name: string;
  /** Hex color like #22C55E */
  color?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  uuid: string;
  /** Decimal string from the API, e.g. "25000" */
  amount: number | string;
  categoryUuid: string;
  /** Category name */
  category: string;
  assetUuid: string;
  assetName: string;
  note?: string;
  date: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Income extends Expense {
  source: string;
}

/** Totals for the incomes or expenses matching a list filter (GET /expenses/summary, /incomes/summary) */
export interface TransactionSummary {
  total: number | string;
  count: number;
  average: number | string;
  byCategory: CategoryTotal[];
  groupBy: "day" | "month";
  series: Array<{ period: string; total: number | string; count: number }>;
}

export interface SavingGoal {
  uuid: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  [key: string]: unknown;
}

/** Debt and receivable status (OpenAPI enum) */
export type DebtReceivableStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

export interface Debt {
  uuid: string;
  partyName: string;
  amount: number;
  paidAmount: number;
  dueDate: string | null;
  status: DebtReceivableStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: Asset | null;
  [key: string]: unknown;
}

export interface DebtPayment {
  uuid: string;
  amount: number;
  date: string;
  note?: string | null;
  createdAt: string;
  [key: string]: unknown;
}

export interface Receivable {
  uuid: string;
  partyName: string;
  amount: number;
  paidAmount: number;
  dueDate: string | null;
  status: DebtReceivableStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: Asset | null;
  [key: string]: unknown;
}

export interface ReceivablePayment {
  uuid: string;
  amount: number;
  date: string;
  note?: string | null;
  createdAt: string;
  [key: string]: unknown;
}

export interface PortfolioSummary {
  totalValue?: number;
  currency?: string;
  assets?: Array<{ uuid: string; name?: string; value?: number; [key: string]: unknown }>;
  [key: string]: unknown;
}

/** One category total in cashflow (expenseByCategory) */
export interface CategoryTotal {
  categoryUuid?: string;
  /** Category name */
  category: string;
  color?: string | null;
  total: number | string;
  count?: number;
  percentage?: number;
}

export interface CashflowSummary {
  period?: string;
  totalIncome?: number;
  totalExpense?: number;
  netSaving?: number;
  savingRate?: number;
  expenseByCategory?: CategoryTotal[];
  /** Alias for UI: totalIncome */
  income?: number;
  /** Alias for UI: totalExpense */
  expense?: number;
  [key: string]: unknown;
}

/** One month in overview trend (for charts) */
export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expense: number;
  netSaving: number;
}

export interface FinancialOverview {
  totalAssets?: number;
  totalSavingGoals?: number;
  totalTargetAmount?: number;
  totalCurrentAmount?: number;
  savingGoalProgress?: number;
  monthlyIncome?: number;
  monthlyExpense?: number;
  monthlyNetSaving?: number;
  monthlyTrend?: MonthlyTrendPoint[];
  totalDebt?: number;
  totalReceivable?: number;
  debtOverdueCount?: number;
  receivableOverdueCount?: number;
  [key: string]: unknown;
}

/** Request body types */
export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface RefreshBody {
  refresh_token: string;
}

/** Body for creating or updating an income/expense; source is required for incomes only. */
export interface TransactionBody {
  assetUuid: string;
  amount: number;
  categoryUuid: string;
  source?: string;
  note?: string;
  date: string;
}

export interface CategoryBody {
  type: CategoryType;
  name: string;
  color?: string;
}

export interface CreateSavingGoalBody {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface CreateDebtRequest {
  partyName: string;
  amount: number;
  dueDate?: string | null;
  note?: string | null;
  assetUuid?: string | null;
}

export interface UpdateDebtRequest {
  partyName?: string | null;
  amount?: number | null;
  dueDate?: string | null;
  note?: string | null;
  assetUuid?: string | null;
}

export interface CreateDebtPaymentRequest {
  amount: number;
  date: string;
  note?: string | null;
  assetUuid?: string | null;
}

export interface CreateReceivableRequest {
  partyName: string;
  amount: number;
  dueDate?: string | null;
  note?: string | null;
  assetUuid?: string | null;
}

export interface UpdateReceivableRequest {
  partyName?: string | null;
  amount?: number | null;
  dueDate?: string | null;
  note?: string | null;
  assetUuid?: string | null;
}

export interface CreateReceivablePaymentRequest {
  amount: number;
  date: string;
  note?: string | null;
  assetUuid?: string | null;
}

/** Current value of one asset (GET /portfolio/assets/{uuid}). Decimals arrive as strings. */
export interface AssetValue {
  uuid: string;
  quantity: number | string;
  currentPrice: number | string;
  value: number | string;
  currency: string;
  /** e.g. "yahoo", "coingecko", "fallback" (purchase price), "manual_update". */
  priceSource: string;
  /** When the market price was fetched; absent for manual or purchase prices. */
  priceAsOf?: string;
  /** The market source was unreachable; currentPrice is the last price fetched (at priceAsOf). */
  priceStale?: boolean;
  /** Units per lot when quantity is counted in lots (IDX stocks: 100). */
  lotSize?: number;
}

/** One ticker match from GET /prices/search, used by the asset form's symbol picker. */
export interface SymbolSearchResult {
  /** Value to store on the asset: BBCA.JK / AAPL for stocks, BTC for crypto. */
  symbol: string;
  name: string;
  exchange?: string;
  /** EQUITY, ETF or COIN. */
  kind?: string;
  /** CoinGecko id the crypto ticker resolves to. */
  coinId?: string;
  /** CoinGecko market-cap rank. */
  rank?: number;
  /** Units per lot when quantity is counted in lots (IDX stocks: 100). */
  lotSize?: number;
}

/** Current market price (GET /prices/{crypto|stock}/{symbol}). price is per unit (per share, not per lot). */
export interface PriceQuote {
  symbol: string;
  price: number;
  currency: string;
  source: string;
  fetchedAt: string;
  lotSize?: number;
  stale?: boolean;
}

/** One point in a price chart time series (from /prices/crypto|stock/{symbol}/chart). */
export interface PriceChartPoint {
  time: string;
  price: number;
}

/** A price chart with the currency its prices are in (a US stock's chart is in USD, not IDR). */
export interface PriceChartSeries {
  currency?: string;
  points: PriceChartPoint[];
}

export interface CreateAssetBody {
  name: string;
  type: AssetType;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  purchaseCurrency: string;
  totalCost: number;
  symbol?: string;
  transactionFee?: number;
  targetPrice?: number;
  description?: string;
  notes?: string;
  maintenanceCost?: number;
  estimatedYield?: number;
  yieldPeriod?: string;
  [key: string]: unknown;
}
