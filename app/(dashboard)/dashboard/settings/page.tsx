"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useChangePasswordForm } from "@/hooks/useChangePasswordForm";
import { isDemoEmail } from "@/lib/demo";
import { ChangePasswordForm } from "@/components/dashboard/settings/ChangePasswordForm";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const changePassword = useChangePasswordForm();

  // The demo account is shared, so its settings stay locked: send it back to the dashboard.
  useEffect(() => {
    if (isDemo) router.replace("/dashboard");
  }, [isDemo, router]);

  if (isLoading || isDemo) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account security.
        </p>
      </div>
      <ChangePasswordForm {...changePassword} />
    </div>
  );
}
