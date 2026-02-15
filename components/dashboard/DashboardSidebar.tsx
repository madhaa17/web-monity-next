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
import { Coins } from "lucide-react";

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
  return (
    <Sidebar side="left" collapsible="offcanvas">
      <SidebarHeader className="flex h-14 shrink-0 items-center justify-center border-b border-sidebar-border px-2">
        <Link href="/dashboard" className="font-semibold text-2xl flex items-center text-primary">
          <Coins className="size-6 shrink-0" />
          <span className="ml-2">Monity</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNavItems.map((item: DashboardNavItem) => {
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
