"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Asset, PriceQuote, SymbolSearchResult } from "@/lib/api/types";
import type { AssetType } from "@/lib/api/types";
import type { PricedAssetType } from "@/lib/api/prices";
import { createAssetSchema, updateAssetSchema } from "@/lib/validations/asset";
import type {
  CreateAssetFormValues,
  UpdateAssetFormValues,
} from "@/lib/validations/asset";
import { formatCurrency, formatQuantity, formatUnitPrice, toNumber } from "@/lib/format";
import { priceQuoteQueryOptions } from "@/lib/queries/prices";
import { useDebounced } from "@/hooks/useDebounced";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SymbolPicker } from "@/components/dashboard/assets/SymbolPicker";

const ASSET_TYPES: AssetType[] = ["CASH", "CRYPTO", "STOCK"];
const TYPE_LABELS: Partial<Record<AssetType, string>> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  STOCK: "Stock",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function pricedType(type: AssetType | undefined): PricedAssetType | null {
  return type === "CRYPTO" || type === "STOCK" ? type : null;
}

/**
 * Units per lot of a stock: from the price lookup, else the picked search result, else the IDX
 * suffix. 1 when quantity is counted in units (crypto, non-IDX stocks).
 */
function unitsPerLot(
  type: PricedAssetType | null,
  symbol: string,
  quote: PriceQuote | undefined,
  picked: SymbolSearchResult | null
): number {
  if (type !== "STOCK") return 1;
  const lot = quote?.lotSize ?? picked?.lotSize ?? (symbol.endsWith(".JK") ? 100 : 0);
  return lot > 1 ? lot : 1;
}

/**
 * Looks up the current price of the symbol once typing has paused, so the form can show what the
 * symbol resolves to before the asset is saved.
 */
function useSymbolQuote(type: PricedAssetType | null, symbol: string, enabled: boolean) {
  const debounced = useDebounced(symbol.trim(), 500);
  const settled = debounced === symbol.trim();
  const query = useQuery({
    ...priceQuoteQueryOptions(type ?? "STOCK", debounced),
    enabled: enabled && type !== null && debounced.length > 0,
  });
  return { ...query, settled };
}

interface QuoteHintProps {
  type: PricedAssetType;
  symbol: string;
  quote: ReturnType<typeof useSymbolQuote>;
  lot: number;
  onUsePrice?: (price: number) => void;
}

function QuoteHint({ type, symbol, quote, lot, onUsePrice }: QuoteHintProps) {
  if (!symbol.trim()) return null;
  if (!quote.settled || quote.isFetching) {
    return (
      <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
        <Loader2 className="size-3 animate-spin" /> Checking price…
      </p>
    );
  }
  if (quote.isError || !quote.data) {
    return (
      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 size-3 shrink-0" />
        No price found for {symbol}. Pick a symbol from the search list.
      </p>
    );
  }
  const unit = type === "CRYPTO" ? symbol : "share";
  return (
    <p className="text-muted-foreground mt-1.5 text-xs">
      Current price:{" "}
      <span className="text-foreground font-medium tabular-nums">
        {formatUnitPrice(quote.data.price, quote.data.currency)}
      </span>{" "}
      / {unit}
      {lot > 1 ? ` · 1 lot = ${lot} shares` : ""}
      {quote.data.stale ? " · last known price" : ""}
      {onUsePrice ? (
        <>
          {" · "}
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => onUsePrice(quote.data.price)}
          >
            Use as purchase price
          </button>
        </>
      ) : null}
    </p>
  );
}

export interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  asset?: Asset | null;
  onSubmitCreate: (data: CreateAssetFormValues) => Promise<void>;
  onSubmitEdit: (data: UpdateAssetFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function AssetFormDialog({
  open,
  onOpenChange,
  mode,
  asset,
  onSubmitCreate,
  onSubmitEdit,
  isSubmitting = false,
}: AssetFormDialogProps) {
  const isCreate = mode === "create";

  const createForm = useForm<CreateAssetFormValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: "",
      type: "CASH",
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: todayISO(),
      purchaseCurrency: "IDR",
      totalCost: 0,
      symbol: "",
      notes: "",
    },
  });

  const editForm = useForm<UpdateAssetFormValues>({
    resolver: zodResolver(updateAssetSchema),
    defaultValues: { name: "", quantity: 0, symbol: "", notes: "" },
  });

  // The search result the user picked, and whether they typed the stock total themselves
  // (e.g. to include broker fees) instead of letting it follow quantity × price.
  const [picked, setPicked] = useState<SymbolSearchResult | null>(null);
  const [totalTouched, setTotalTouched] = useState(false);
  // The name last filled in from a picked symbol; a name the user typed is never overwritten.
  const autoName = useRef("");

  useEffect(() => {
    if (open && asset && !isCreate) {
      editForm.reset({
        name: asset.name ?? "",
        quantity: toNumber(asset.quantity),
        symbol: (asset.symbol as string) ?? "",
        notes: (asset.notes as string) ?? "",
      });
    }
  }, [open, asset, isCreate, editForm]);

  useEffect(() => {
    if (open && isCreate) {
      createForm.reset({
        name: "",
        type: "CASH",
        quantity: 1,
        purchasePrice: 0,
        purchaseDate: todayISO(),
        purchaseCurrency: "IDR",
        totalCost: 0,
        symbol: "",
        notes: "",
      });
      setPicked(null);
      setTotalTouched(false);
      autoName.current = "";
    }
  }, [open, isCreate, createForm]);

  const createType = createForm.watch("type");
  const createTotalCost = createForm.watch("totalCost");
  const createSymbol = createForm.watch("symbol") ?? "";
  const createQuantity = Number(createForm.watch("quantity")) || 0;
  const createPrice = Number(createForm.watch("purchasePrice")) || 0;
  const createPriced = pricedType(createType);
  const createQuote = useSymbolQuote(createPriced, createSymbol, open && isCreate);
  const createLot = unitsPerLot(createPriced, createSymbol, createQuote.data, picked);
  const isCrypto = createType === "CRYPTO";
  const unitNoun = isCrypto ? createSymbol.trim() || "coin" : "share";
  // Rupiah has no practical minor unit, so the total is kept whole even for fractional coins.
  const pricedTotal = Math.round(createQuantity * createLot * createPrice);

  useEffect(() => {
    if (createType === "CASH" && open && isCreate) {
      const amount = Number(createTotalCost) || 0;
      createForm.setValue("quantity", amount);
      createForm.setValue("purchasePrice", 1);
    }
  }, [createType, createTotalCost, open, isCreate, createForm]);

  // A stock or coin's total cost follows quantity (× shares per lot) × price until the user edits it.
  useEffect(() => {
    if (createPriced && open && isCreate && !totalTouched) {
      createForm.setValue("totalCost", pricedTotal);
    }
  }, [createPriced, pricedTotal, totalTouched, open, isCreate, createForm]);

  const editSymbol = editForm.watch("symbol") ?? "";
  const editPriced = pricedType(asset?.type);
  const editQuote = useSymbolQuote(editPriced, editSymbol, open && !isCreate);
  const editLot = unitsPerLot(editPriced, editSymbol, editQuote.data, null);
  const editQuantity = Number(editForm.watch("quantity")) || 0;

  const onPickSymbol = (symbol: string, result: SymbolSearchResult | null) => {
    createForm.setValue("symbol", symbol, { shouldValidate: createForm.formState.isSubmitted });
    setPicked(result);
    if (result) {
      const name = createForm.getValues("name");
      if (!name.trim() || name === autoName.current) {
        autoName.current = result.name;
        createForm.setValue("name", result.name, { shouldValidate: createForm.formState.isSubmitted });
      }
    }
  };

  const handleCreate = createForm.handleSubmit(async (data) => {
    const priced = pricedType(data.type);
    // A typed ticker must resolve to a price; a picked one may save even if pricing is down
    // (the portfolio then falls back to the purchase price).
    if (priced && !picked && !(createQuote.settled && createQuote.isSuccess)) {
      createForm.setError("symbol", {
        message: `No price found for ${data.symbol}. Pick a symbol from the search list.`,
      });
      return;
    }

    if (data.type === "STOCK" && createLot > 1 && !Number.isInteger(data.quantity)) {
      createForm.setError("quantity", {
        message: `Lots must be a whole number (1 lot = ${createLot} shares)`,
      });
      return;
    }
    // A typed IDX ticker (BBCA) is stored as its exchange symbol (BBCA.JK), like a picked one.
    let symbol = data.symbol?.trim().toUpperCase();
    if (symbol && data.type === "STOCK" && !picked && createLot > 1 && !symbol.includes(".")) {
      symbol = `${symbol}.JK`;
    }

    const isCash = data.type === "CASH";
    let quantity = data.quantity;
    let purchasePrice = data.purchasePrice;
    let totalCost = data.totalCost;
    if (isCash) {
      quantity = Number(data.totalCost) || 0;
      purchasePrice = 1;
      totalCost = quantity;
    } else if (priced) {
      totalCost = totalTouched && data.totalCost > 0
        ? data.totalCost
        : Math.round(data.quantity * createLot * data.purchasePrice);
    }

    await onSubmitCreate({
      ...data,
      symbol,
      quantity,
      purchasePrice,
      totalCost,
      purchaseDate: isCash ? todayISO() : data.purchaseDate,
      purchaseCurrency: "IDR",
    });
    onOpenChange(false);
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    const symbolChanged = (data.symbol ?? "").trim() !== ((asset?.symbol as string) ?? "");
    if (editPriced && symbolChanged && !(editQuote.settled && editQuote.isSuccess)) {
      editForm.setError("symbol", {
        message: `No price found for ${data.symbol}. Pick a symbol from the search list.`,
      });
      return;
    }
    await onSubmitEdit({ ...data, symbol: data.symbol?.trim().toUpperCase() });
    onOpenChange(false);
  });

  const createErrors = createForm.formState.errors;
  const marketValue =
    createPriced && createQuote.data ? createQuantity * createLot * createQuote.data.price : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add asset" : "Edit asset"}</DialogTitle>
        </DialogHeader>
        {isCreate ? (
          <form onSubmit={handleCreate} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Type</FieldLabel>
              <FieldContent>
                <Select
                  value={createType}
                  onValueChange={(v) => {
                    const type = v as AssetType;
                    createForm.setValue("type", type);
                    createForm.setValue("symbol", "");
                    createForm.clearErrors();
                    setPicked(null);
                    setTotalTouched(false);
                    if (createForm.getValues("name") === autoName.current) {
                      createForm.setValue("name", "");
                    }
                    autoName.current = "";
                    if (type === "CASH") {
                      const total = createForm.getValues("totalCost") || 0;
                      createForm.setValue("quantity", total);
                      createForm.setValue("purchasePrice", 1);
                      createForm.setValue("totalCost", total);
                    } else {
                      createForm.setValue("quantity", 1);
                      createForm.setValue("purchasePrice", 0);
                      createForm.setValue("totalCost", 0);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABELS[t] ?? t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            {createPriced && (
              <Field>
                <FieldLabel htmlFor="symbol">Symbol</FieldLabel>
                <FieldContent>
                  <SymbolPicker
                    id="symbol"
                    type={createPriced}
                    value={createSymbol}
                    onChange={onPickSymbol}
                    invalid={!!createErrors.symbol}
                  />
                  <FieldError errors={createErrors.symbol ? [createErrors.symbol] : undefined} />
                  {picked ? (
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {picked.name}
                      {picked.exchange ? ` · ${picked.exchange}` : ""}
                    </p>
                  ) : null}
                  <QuoteHint
                    type={createPriced}
                    symbol={createSymbol}
                    quote={createQuote}
                    lot={createLot}
                    onUsePrice={(price) =>
                      createForm.setValue(
                        "purchasePrice",
                        // A coin can trade below Rp 1, so keep its fraction; IDR share prices are whole.
                        isCrypto ? Number(price.toPrecision(8)) : Math.round(price),
                        { shouldValidate: createForm.formState.isSubmitted }
                      )
                    }
                  />
                </FieldContent>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder={
                    createPriced ? "Filled in from the symbol" : "e.g. Main savings bank account"
                  }
                  {...createForm.register("name")}
                  aria-invalid={!!createErrors.name}
                />
                <FieldError errors={createErrors.name ? [createErrors.name] : undefined} />
              </FieldContent>
            </Field>

            {createType === "CASH" ? (
              <Field>
                <FieldLabel htmlFor="cashAmount">Amount</FieldLabel>
                <FieldContent>
                  <Controller
                    control={createForm.control}
                    name="totalCost"
                    render={({ field }) => (
                      <CurrencyInput
                        id="cashAmount"
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={!!createErrors.totalCost}
                      />
                    )}
                  />
                  <FieldError errors={createErrors.totalCost ? [createErrors.totalCost] : undefined} />
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    Enter your current cash balance.
                  </p>
                </FieldContent>
              </Field>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="quantity">
                    {isCrypto
                      ? `Amount of ${createSymbol.trim() || "coins"}`
                      : createLot > 1
                        ? "Quantity (lots)"
                        : "Quantity (shares)"}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="quantity"
                      type="number"
                      inputMode="decimal"
                      step={createLot > 1 ? 1 : "any"}
                      min={0}
                      placeholder={isCrypto ? "e.g. 0.0125" : undefined}
                      {...createForm.register("quantity", { valueAsNumber: true })}
                      aria-invalid={!!createErrors.quantity}
                    />
                    <FieldError errors={createErrors.quantity ? [createErrors.quantity] : undefined} />
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {isCrypto
                        ? "The number of coins you hold, as shown in your wallet or exchange."
                        : createLot > 1
                          ? `${formatQuantity(createQuantity)} lot = ${formatQuantity(createQuantity * createLot)} shares (1 lot = ${createLot} shares)`
                          : "Number of shares you own."}
                    </p>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="purchasePrice">Buy price per {unitNoun}</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={createForm.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <CurrencyInput
                          id="purchasePrice"
                          value={field.value}
                          onChange={field.onChange}
                          decimals={isCrypto ? 8 : 0}
                          placeholder="0"
                          aria-invalid={!!createErrors.purchasePrice}
                        />
                      )}
                    />
                    <FieldError
                      errors={createErrors.purchasePrice ? [createErrors.purchasePrice] : undefined}
                    />
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      Average price per {unitNoun}
                      {createLot > 1 ? " (not per lot)" : ""}, in rupiah
                      {isCrypto ? ". Use a comma for decimals, e.g. 0,089" : ""}.
                    </p>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="totalCost">Total cost</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={createForm.control}
                      name="totalCost"
                      render={({ field }) => (
                        <CurrencyInput
                          id="totalCost"
                          value={field.value}
                          onChange={(v) => {
                            setTotalTouched(true);
                            field.onChange(v);
                          }}
                          placeholder="0"
                          aria-invalid={!!createErrors.totalCost}
                        />
                      )}
                    />
                    <FieldError errors={createErrors.totalCost ? [createErrors.totalCost] : undefined} />
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {totalTouched ? (
                        <>
                          Entered manually.{" "}
                          <button
                            type="button"
                            className="text-primary underline-offset-2 hover:underline"
                            onClick={() => setTotalTouched(false)}
                          >
                            Reset to {formatCurrency(pricedTotal)}
                          </button>
                        </>
                      ) : (
                        `Quantity × ${createLot > 1 ? `${createLot} × ` : ""}price per ${unitNoun}. Edit to include ${isCrypto ? "exchange" : "broker"} fees.`
                      )}
                    </p>
                  </FieldContent>
                </Field>
              </>
            )}

            {createType !== "CASH" && (
              <Field>
                <FieldLabel htmlFor="purchaseDate">Purchase date</FieldLabel>
                <FieldContent>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...createForm.register("purchaseDate")}
                    aria-invalid={!!createErrors.purchaseDate}
                  />
                  <FieldError errors={createErrors.purchaseDate ? [createErrors.purchaseDate] : undefined} />
                </FieldContent>
              </Field>
            )}

            {marketValue != null && createQuantity > 0 ? (
              <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value at today&apos;s price</span>
                  <span className="font-medium tabular-nums">{formatCurrency(marketValue)}</span>
                </div>
                {Number(createTotalCost) > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="tabular-nums">{formatCurrency(Number(createTotalCost))}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <FieldContent>
                <Input id="notes" placeholder="e.g. Bought via Bibit, long-term" {...createForm.register("notes")} />
              </FieldContent>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleEdit} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="edit-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  aria-invalid={!!editForm.formState.errors.name}
                />
                <FieldError
                  errors={
                    editForm.formState.errors.name
                      ? [editForm.formState.errors.name]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
            {asset?.type === "CASH" ? (
              <Field>
                <FieldLabel htmlFor="edit-amount">Amount</FieldLabel>
                <FieldContent>
                  <Controller
                    control={editForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <CurrencyInput
                        id="edit-amount"
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={!!editForm.formState.errors.quantity}
                      />
                    )}
                  />
                  <FieldError
                    errors={
                      editForm.formState.errors.quantity
                        ? [editForm.formState.errors.quantity]
                        : undefined
                    }
                  />
                </FieldContent>
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="edit-quantity">
                  {asset?.type === "CRYPTO"
                    ? `Amount of ${editSymbol.trim() || "coins"}`
                    : asset?.type === "STOCK"
                      ? editLot > 1
                        ? "Quantity (lots)"
                        : "Quantity (shares)"
                      : "Quantity"}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="edit-quantity"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...editForm.register("quantity", { valueAsNumber: true })}
                    aria-invalid={!!editForm.formState.errors.quantity}
                  />
                  <FieldError
                    errors={
                      editForm.formState.errors.quantity
                        ? [editForm.formState.errors.quantity]
                        : undefined
                    }
                  />
                  {asset?.type === "STOCK" && editLot > 1 ? (
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {formatQuantity(editQuantity)} lot = {formatQuantity(editQuantity * editLot)} shares
                    </p>
                  ) : null}
                </FieldContent>
              </Field>
            )}
            {editPriced && (
              <Field>
                <FieldLabel htmlFor="edit-symbol">Symbol</FieldLabel>
                <FieldContent>
                  <SymbolPicker
                    id="edit-symbol"
                    type={editPriced}
                    value={editSymbol}
                    onChange={(symbol) =>
                      editForm.setValue("symbol", symbol, {
                        shouldValidate: editForm.formState.isSubmitted,
                      })
                    }
                    invalid={!!editForm.formState.errors.symbol}
                  />
                  <FieldError
                    errors={
                      editForm.formState.errors.symbol
                        ? [editForm.formState.errors.symbol]
                        : undefined
                    }
                  />
                  <QuoteHint type={editPriced} symbol={editSymbol} quote={editQuote} lot={editLot} />
                </FieldContent>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="edit-notes">Notes (optional)</FieldLabel>
              <FieldContent>
                <Input id="edit-notes" placeholder="e.g. Main savings bank account, etc." {...editForm.register("notes")} />
              </FieldContent>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
