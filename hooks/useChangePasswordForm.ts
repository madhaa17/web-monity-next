"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { changePassword } from "@/lib/api/auth";
import { setTokens } from "@/lib/api/client";
import type { ChangePasswordFormValues } from "@/lib/validations/auth";
import { changePasswordSchema } from "@/lib/validations/auth";

export function useChangePasswordForm() {
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isSubmitting } = formState;

  async function onSubmit(data: ChangePasswordFormValues) {
    setApiError(null);
    try {
      const res = await changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      if (!res.token || !res.refreshToken) {
        throw new Error("Invalid response from server");
      }
      // Tokens issued before the change are now rejected, so keep this session on the new pair.
      await setTokens(res.token, res.refreshToken);
      reset();
      toast.success("Password changed. Other devices have been signed out.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      setApiError(message);
      toast.error(message);
    }
  }

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    apiError,
    onSubmit,
  };
}
