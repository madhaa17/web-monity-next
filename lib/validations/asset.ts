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
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a quantity" })
    .min(0, "Quantity must be ≥ 0"),
  purchasePrice: z.coerce
    .number({ invalid_type_error: "Enter a price" })
    .min(0, "Purchase price must be ≥ 0"),
  purchaseDate: z.string().min(1, "Date required"),
  purchaseCurrency: z.string().min(1, "Currency required"),
  totalCost: z.coerce
    .number({ invalid_type_error: "Enter an amount" })
    .min(0, "Total cost must be ≥ 0"),
  symbol: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((v, ctx) => {
  if (v.type !== "CRYPTO" && v.type !== "STOCK") return;
  if (!v.symbol?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["symbol"], message: "Pick a symbol from the list" });
  }
  if (!(v.quantity > 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["quantity"], message: "Quantity must be more than 0" });
  }
  if (!(v.purchasePrice > 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["purchasePrice"],
      message: v.type === "CRYPTO" ? "Enter the price per coin" : "Enter the price per share",
    });
  }
});

export const updateAssetSchema = z.object({
  name: z.string().min(1, "Name required"),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a quantity" })
    .min(0, "Quantity must be ≥ 0"),
  symbol: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAssetFormValues = z.infer<typeof createAssetSchema>;
export type UpdateAssetFormValues = z.infer<typeof updateAssetSchema>;
