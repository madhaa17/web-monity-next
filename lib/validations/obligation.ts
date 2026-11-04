import { z } from "zod";

export const obligationFormSchema = z.object({
  partyName: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  /** yyyy-mm-dd, or empty for no due date */
  dueDate: z.string().optional(),
  note: z.string().max(500, "Note must be at most 500 characters").optional(),
  /** CASH asset UUID, or empty for a record without cash movement */
  assetUuid: z.string().optional(),
});

export const paymentFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  note: z.string().max(500, "Note must be at most 500 characters").optional(),
  assetUuid: z.string().optional(),
});

export type ObligationFormValues = z.infer<typeof obligationFormSchema>;
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
