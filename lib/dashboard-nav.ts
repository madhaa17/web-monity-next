import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  BarChart3,
  HandCoins,
  LayoutDashboard,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/assets", label: "Assets", icon: Wallet },
  { href: "/dashboard/incomes", label: "Incomes", icon: TrendingUp },
  { href: "/dashboard/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/dashboard/saving-goals", label: "Saving goals", icon: Target },
  { href: "/dashboard/debts", label: "Debts", icon: HandCoins },
  { href: "/dashboard/receivables", label: "Receivables", icon: ArrowRightLeft },
  { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
];
