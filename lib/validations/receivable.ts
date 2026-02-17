import { z } from "zod";

export const createReceivableSchema = z.object({
  partyName: z.string().min(1, "Party name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.string().optional(),
  note: z.string().optional(),
  assetUuid: z.string().optional(),
});

export const updateReceivableSchema = z.object({
  partyName: z.string().min(1, "Party name is required").optional(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0").optional(),
  dueDate: z.string().optional(),
  note: z.string().optional(),
  assetUuid: z.string().optional(),
});

export const createReceivablePaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
  assetUuid: z.string().optional(),
});

export type CreateReceivableFormValues = z.infer<typeof createReceivableSchema>;
export type UpdateReceivableFormValues = z.infer<typeof updateReceivableSchema>;
export type CreateReceivablePaymentFormValues = z.infer<typeof createReceivablePaymentSchema>;
