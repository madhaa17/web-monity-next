"use client";

import Link from "next/link";
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import type { LoginFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface LoginFormProps {
  register: UseFormRegister<LoginFormValues>;
  handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  isSubmitting: boolean;
  apiError: string | null;
  onSubmit: (data: LoginFormValues) => Promise<void>;
}

export function LoginForm({
  register,
  handleSubmit,
  errors,
  isSubmitting,
  apiError,
  onSubmit,
}: LoginFormProps) {
  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={errors.password ? [errors.password] : undefined} />
          </FieldContent>
        </Field>
        <FieldError
          errors={apiError ? [{ message: apiError }] : undefined}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-zinc-900 dark:text-zinc-100 underline-offset-2 hover:underline"
        >
          Register
        </Link>
      </p>
    </>
  );
}
