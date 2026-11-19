"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { DashboardNavItem } from "@/lib/dashboard-nav";
import { dashboardNavItems } from "@/lib/dashboard-nav";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/hooks/useAuth";
import { isDemoEmail } from "@/lib/demo";

export interface DashboardSidebarProps {
  pathname: string;
  isLoggingOut: boolean;
  onLogout: () => void;
}

export function DashboardSidebar({
  pathname,
  isLoggingOut,
  onLogout,
}: DashboardSidebarProps) {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const navItems = dashboardNavItems.filter((item) => !(isDemo && item.hiddenForDemo));

  return (
    <Sidebar side="left" collapsible="offcanvas">
      <SidebarHeader className="flex h-14 shrink-0 items-center justify-center border-b border-sidebar-border px-2">
        <Link href="/dashboard" aria-label="MoneyTor dashboard" className="text-2xl">
          <Logo markClassName="size-8" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item: DashboardNavItem) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <Button
          variant="secondary"
          className="w-full justify-start"
          disabled={isLoggingOut}
          onClick={() => void onLogout()}
        >
          <LogOut className="size-4 shrink-0" />
          <span>{isLoggingOut ? "Logging out…" : "Log out"}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
