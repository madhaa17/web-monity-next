"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerApi } from "@/lib/api/auth";
import type { RegisterFormValues } from "@/lib/validations/auth";
import { registerSchema } from "@/lib/validations/auth";

export function useRegisterForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  async function onSubmit(data: RegisterFormValues) {
    setApiError(null);
    try {
      const res = await registerApi(data);
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
          setApiError("Failed to set session");
        }
      } else {
        setApiError("Invalid response from server");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Registration failed");
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
