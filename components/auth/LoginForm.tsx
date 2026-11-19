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
import { PasswordInput } from "@/components/ui/password-input";
import { DEMO_ACCOUNT } from "@/lib/demo";

export interface LoginFormProps {
  register: UseFormRegister<LoginFormValues>;
  handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  isSubmitting: boolean;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  fillDemo: () => void;
}

export function LoginForm({
  register,
  handleSubmit,
  errors,
  isSubmitting,
  onSubmit,
  fillDemo,
}: LoginFormProps) {
  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>
      <div className="mb-4 rounded-md border border-dashed border-zinc-300 p-3 text-sm dark:border-zinc-700">
        <p className="font-medium">Demo account</p>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-zinc-600 dark:text-zinc-400">
          <dt>Email</dt>
          <dd className="font-mono break-all select-all">{DEMO_ACCOUNT.email}</dd>
          <dt>Password</dt>
          <dd className="font-mono select-all">{DEMO_ACCOUNT.password}</dd>
        </dl>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={fillDemo}
          disabled={isSubmitting}
        >
          Use demo account
        </Button>
      </div>
      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
            <PasswordInput
              id="password"
              placeholder="********"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={errors.password ? [errors.password] : undefined} />
          </FieldContent>
        </Field>
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
