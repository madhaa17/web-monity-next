"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerApi } from "@/lib/api/auth";
import { setTokens } from "@/lib/api/client";
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
      setTokens(res.Token, res.RefreshToken);
      router.push("/dashboard");
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
