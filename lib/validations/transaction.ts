import { z } from "zod";

const baseTransactionSchema = z.object({
  assetUuid: z.string().min(1, "Select an asset"),
  amount: z.coerce
    .number()
    .min(0.01, "Amount must be greater than 0")
    .refine((n) => Math.round(n * 100) === n * 100, "Use at most 2 decimal places"),
  categoryUuid: z.string().min(1, "Select a category"),
  note: z.string().max(500, "Note must be at most 500 characters").optional(),
  date: z.string().min(1, "Date required"),
});

/** Create and edit use the same fields: amount, asset and category can all be changed later. */
export const expenseFormSchema = baseTransactionSchema;

export const incomeFormSchema = baseTransactionSchema.extend({
  source: z
    .string()
    .trim()
    .min(1, "Source is required")
    .max(200, "Source must be at most 200 characters"),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
/** Income form values; for expenses, source is absent. */
export type TransactionFormValues = ExpenseFormValues & { source?: string };

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Pick a color")
    .optional()
    .or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
