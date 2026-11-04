"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { login } from "@/lib/api/auth";
import type { LoginFormValues } from "@/lib/validations/auth";
import { loginSchema } from "@/lib/validations/auth";

export function useLoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  async function onSubmit(data: LoginFormValues) {
    try {
      const res = await login(data);
      if (!res.token || !res.refreshToken) {
        toast.error("Invalid response from server");
        return;
      }
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: res.token, refreshToken: res.refreshToken }),
      });
      if (sessionRes.ok) {
        router.push("/dashboard");
      } else {
        toast.error("Failed to set session");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  }

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
  };
}
