import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  Expense,
  Income,
  ListResponse,
  TransactionBody,
  TransactionKind,
  TransactionSummary,
} from "@/lib/api/types";
import {
  buildListQuery,
  type TransactionFilterParams,
  type TransactionListParams,
} from "@/lib/api/list-params";

/** Income and expense endpoints differ only by path: /incomes vs /expenses. */
export type Transaction<K extends TransactionKind> = K extends "income" ? Income : Expense;

function basePath(kind: TransactionKind): string {
  return kind === "income" ? "/incomes" : "/expenses";
}

function normalizeListResponse<T>(data: unknown): ListResponse<T> {
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as ListResponse<T>).items)) {
    const r = data as ListResponse<T>;
    return { items: r.items, meta: r.meta };
  }
  if (Array.isArray(data)) return { items: data as T[] };
  return { items: [] };
}

export async function listTransactions<K extends TransactionKind>(
  kind: K,
  params?: TransactionListParams
): Promise<ListResponse<Transaction<K>>> {
  const res = await apiClient<ApiResponse<ListResponse<Transaction<K>>>>(
    `${basePath(kind)}${buildListQuery(params)}`
  );
  return normalizeListResponse<Transaction<K>>(res.data);
}

export async function getTransactionSummary(
  kind: TransactionKind,
  params?: TransactionFilterParams & { group_by?: "day" | "month" }
): Promise<TransactionSummary> {
  const res = await apiClient<ApiResponse<TransactionSummary>>(
    `${basePath(kind)}/summary${buildListQuery(params)}`
  );
  return res.data;
}

export async function createTransaction<K extends TransactionKind>(
  kind: K,
  body: TransactionBody
): Promise<Transaction<K>> {
  const res = await apiClient<ApiResponse<Transaction<K>>>(basePath(kind), {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function updateTransaction<K extends TransactionKind>(
  kind: K,
  uuid: string,
  body: Partial<TransactionBody>
): Promise<Transaction<K>> {
  const res = await apiClient<ApiResponse<Transaction<K>>>(`${basePath(kind)}/${uuid}`, {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function deleteTransaction(kind: TransactionKind, uuid: string): Promise<void> {
  await apiClient<unknown>(`${basePath(kind)}/${uuid}`, { method: "DELETE" });
}
