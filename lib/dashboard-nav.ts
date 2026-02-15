import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  BarChart3,
  LayoutDashboard,
  PieChart,
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
  { href: "/dashboard/expenses", label: "Expenses", icon: ArrowUpDown },
  { href: "/dashboard/incomes", label: "Incomes", icon: TrendingUp },
  { href: "/dashboard/saving-goals", label: "Saving goals", icon: Target },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
];
