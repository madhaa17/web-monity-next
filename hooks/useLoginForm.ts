"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/api/auth";
import { setTokens } from "@/lib/api/client";
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
      setTokens(res.Token, res.RefreshToken);
      router.push("/dashboard");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Login failed");
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
