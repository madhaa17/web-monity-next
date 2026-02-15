import { z } from "zod";

const categoryEnum = z.enum([
  "FOOD",
  "TRANSPORT",
  "HOUSING",
  "UTILITIES",
  "HEALTH",
  "ENTERTAINMENT",
  "SHOPPING",
  "OTHER",
]);

export const createExpenseSchema = z.object({
  assetUuid: z.string().min(1, "Select an asset"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: categoryEnum,
  note: z.string().optional(),
  date: z.string().min(1, "Date required"),
});

export const updateExpenseSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: categoryEnum,
  note: z.string().optional(),
  date: z.string().min(1, "Date required"),
});

export type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseFormValues = z.infer<typeof updateExpenseSchema>;
