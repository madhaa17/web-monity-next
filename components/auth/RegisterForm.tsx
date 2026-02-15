"use client";

import Link from "next/link";
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import type { RegisterFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface RegisterFormProps {
  register: UseFormRegister<RegisterFormValues>;
  handleSubmit: UseFormHandleSubmit<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  isSubmitting: boolean;
  apiError: string | null;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
}

export function RegisterForm({
  register,
  handleSubmit,
  errors,
  isSubmitting,
  apiError,
  onSubmit,
}: RegisterFormProps) {
  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <FieldContent>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </FieldContent>
        </Field>
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
              autoComplete="new-password"
              placeholder="********"
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
          {isSubmitting ? "Creating account…" : "Register"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 dark:text-zinc-100 underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
