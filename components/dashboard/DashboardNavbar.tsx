"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getInitials } from "@/lib/user";
import type { User } from "@/lib/api/types";

export interface DashboardNavbarProps {
  user: User | undefined;
  isLoading: boolean;
}

export function DashboardNavbar({ user, isLoading }: DashboardNavbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2 md:gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block">
          <p className="max-w-[180px] truncate text-sm font-medium">
            {isLoading ? "…" : user?.name || "—"}
          </p>
          <p className="max-w-[180px] truncate text-xs text-muted-foreground">
            {isLoading ? "…" : user?.email ?? ""}
          </p>
        </div>
      </div>
    </header>
  );
}
