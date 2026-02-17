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

/** Expense categories */
export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "HOUSING"
  | "UTILITIES"
  | "HEALTH"
  | "ENTERTAINMENT"
  | "SHOPPING"
  | "OTHER";

export interface Expense {
  uuid: string;
  assetUuid: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string;
  asset?: Asset | null;
  [key: string]: unknown;
}

export interface Income {
  uuid: string;
  assetUuid: string;
  amount: number;
  source?: string;
  note?: string;
  date: string;
  asset?: Asset | null;
  [key: string]: unknown;
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
  category: string;
  total: number;
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

export interface CreateExpenseBody {
  assetUuid: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string;
}

export interface CreateIncomeBody {
  assetUuid: string;
  amount: number;
  source: string;
  note?: string;
  date: string;
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

/** One point in a price chart time series (from /prices/crypto|stock/{symbol}/chart). */
export interface PriceChartPoint {
  time: string;
  price: number;
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
