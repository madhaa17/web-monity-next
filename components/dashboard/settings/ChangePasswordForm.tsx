"use client";

import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import type { ChangePasswordFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

export interface ChangePasswordFormProps {
  register: UseFormRegister<ChangePasswordFormValues>;
  handleSubmit: UseFormHandleSubmit<ChangePasswordFormValues>;
  errors: FieldErrors<ChangePasswordFormValues>;
  isSubmitting: boolean;
  apiError: string | null;
  onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
}

export function ChangePasswordForm({
  register,
  handleSubmit,
  errors,
  isSubmitting,
  apiError,
  onSubmit,
}: ChangePasswordFormProps) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          At least 8 characters with a letter and a digit. Other devices will be signed out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Field>
            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
            <FieldContent>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                aria-invalid={!!errors.currentPassword}
                {...register("currentPassword")}
              />
              <FieldError errors={errors.currentPassword ? [errors.currentPassword] : undefined} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
            <FieldContent>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
              <FieldError errors={errors.newPassword ? [errors.newPassword] : undefined} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
            <FieldContent>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <FieldError errors={errors.confirmPassword ? [errors.confirmPassword] : undefined} />
            </FieldContent>
          </Field>
          <FieldError
            errors={apiError ? [{ message: apiError }] : undefined}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
