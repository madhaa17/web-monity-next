import { z } from "zod";

export const createSavingGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  targetAmount: z.coerce.number().min(0.01, "Target must be greater than 0"),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative"),
  deadline: z.string().optional(),
});

export const updateSavingGoalSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  targetAmount: z.coerce.number().min(0.01, "Target must be greater than 0").optional(),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative").optional(),
  deadline: z.string().optional(),
});

export type CreateSavingGoalFormValues = z.infer<typeof createSavingGoalSchema>;
export type UpdateSavingGoalFormValues = z.infer<typeof updateSavingGoalSchema>;
