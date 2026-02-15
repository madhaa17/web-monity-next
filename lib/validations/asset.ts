import { z } from "zod";

const assetTypeEnum = z.enum([
  "CASH",
  "CRYPTO",
  "STOCK",
  "LIVESTOCK",
  "REAL_ESTATE",
  "OTHER",
]);

export const createAssetSchema = z.object({
  name: z.string().min(1, "Name required"),
  type: assetTypeEnum,
  quantity: z.coerce.number().min(0, "Quantity must be ≥ 0"),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be ≥ 0"),
  purchaseDate: z.string().min(1, "Date required"),
  purchaseCurrency: z.string().min(1, "Currency required"),
  totalCost: z.coerce.number().min(0, "Total cost must be ≥ 0"),
  symbol: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1, "Name required"),
  quantity: z.coerce.number().min(0, "Quantity must be ≥ 0"),
  notes: z.string().optional(),
});

export type CreateAssetFormValues = z.infer<typeof createAssetSchema>;
export type UpdateAssetFormValues = z.infer<typeof updateAssetSchema>;
