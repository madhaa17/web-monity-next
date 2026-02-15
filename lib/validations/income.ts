import { z } from "zod";

export const createIncomeSchema = z.object({
  assetUuid: z.string().min(1, "Select an asset"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  source: z.string().optional(),
  note: z.string().optional(),
  date: z.string().min(1, "Date required"),
});

export const updateIncomeSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  source: z.string().optional(),
  note: z.string().optional(),
  date: z.string().min(1, "Date required"),
});

export type CreateIncomeFormValues = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeFormValues = z.infer<typeof updateIncomeSchema>;
