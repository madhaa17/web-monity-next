import { z } from "zod";

/** Mirrors the backend password policy: 8–72 characters with at least one letter and one digit. */
const passwordSchema = z
  .string()
  .min(8, "Password at least 8 characters")
  .max(72, "Password at most 72 characters")
  .regex(/\p{L}/u, "Password must contain a letter")
  .regex(/\p{N}/u, "Password must contain a digit");

export const loginSchema = z.object({
  email: z.string().min(1, "Email required").email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().min(1, "Email required").email("Invalid email"),
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
