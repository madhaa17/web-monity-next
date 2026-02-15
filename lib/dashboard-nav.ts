import type { LucideIcon } from "lucide-react";
import {
  TrendingDown,
  BarChart3,
  LayoutDashboard,
  Target,
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
  { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
];
