"use client";

import { useChangePasswordForm } from "@/hooks/useChangePasswordForm";
import { ChangePasswordForm } from "@/components/dashboard/settings/ChangePasswordForm";

export default function SettingsPage() {
  const changePassword = useChangePasswordForm();

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
