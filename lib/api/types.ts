/** API response wrapper (Postman: most endpoints return { data: T }) */
export interface ApiResponse<T> {
  data: T;
}

/** Auth: login/register return Token + RefreshToken */
export interface AuthResponse {
  Token: string;
  RefreshToken: string;
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
  [key: string]: unknown;
}

export interface Income {
  uuid: string;
  assetUuid: string;
  amount: number;
  source?: string;
  note?: string;
  date: string;
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

export interface PortfolioSummary {
  totalValue?: number;
  currency?: string;
  assets?: Array<{ uuid: string; name?: string; value?: number; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface CashflowSummary {
  income?: number;
  expense?: number;
  [key: string]: unknown;
}

export interface FinancialOverview {
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
  source?: string;
  note?: string;
  date: string;
}

export interface CreateSavingGoalBody {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
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
