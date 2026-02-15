"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";

function CloseSidebarOnNavigate() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { mounted, isLoggingOut, handleLogout } = useDashboardAuth();

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <CloseSidebarOnNavigate />
      <DashboardSidebar
        pathname={pathname}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <DashboardNavbar user={user} isLoading={isLoading} />
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
