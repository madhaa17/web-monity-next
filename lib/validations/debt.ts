import { z } from "zod";

export const createDebtSchema = z.object({
  partyName: z.string().min(1, "Party name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.string().optional(),
  note: z.string().optional(),
  assetUuid: z.string().optional(),
});

export const updateDebtSchema = z.object({
  partyName: z.string().min(1, "Party name is required").optional(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0").optional(),
  dueDate: z.string().optional(),
  note: z.string().optional(),
  assetUuid: z.string().optional(),
});

export const createDebtPaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
  assetUuid: z.string().optional(),
});

export type CreateDebtFormValues = z.infer<typeof createDebtSchema>;
export type UpdateDebtFormValues = z.infer<typeof updateDebtSchema>;
export type CreateDebtPaymentFormValues = z.infer<typeof createDebtPaymentSchema>;
