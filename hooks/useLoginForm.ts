"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { login } from "@/lib/api/auth";
import type { LoginFormValues } from "@/lib/validations/auth";
import { loginSchema } from "@/lib/validations/auth";

export function useLoginForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  async function onSubmit(data: LoginFormValues) {
    setApiError(null);
    try {
      const res = await login(data);
      if (res.token && res.refreshToken) {
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: res.token, refreshToken: res.refreshToken }),
        });
        if (sessionRes.ok) {
          router.push("/dashboard");
        } else {
          const msg = "Failed to set session";
          setApiError(msg);
          toast.error(msg);
        }
      } else {
        const msg = "Invalid response from server";
        setApiError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
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
