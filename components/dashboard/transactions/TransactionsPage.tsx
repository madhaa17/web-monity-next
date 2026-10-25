"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import type { TransactionBody, TransactionKind } from "@/lib/api/types";
import type { Transaction } from "@/lib/api/transactions";
import { categoryTypeOf } from "@/lib/queries/transactions";
import { useTransactionsData } from "@/hooks/useTransactionsData";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { CategoryManagerDialog } from "@/components/dashboard/transactions/CategoryManagerDialog";
import { TransactionFilters } from "@/components/dashboard/transactions/TransactionFilters";
import { TransactionFormDialog } from "@/components/dashboard/transactions/TransactionFormDialog";
import { TransactionList } from "@/components/dashboard/transactions/TransactionList";
import { TransactionSummaryCard } from "@/components/dashboard/transactions/TransactionSummaryCard";

const COPY: Record<TransactionKind, { title: string; subtitle: string; add: string; search: string }> = {
  income: {
    title: "Incomes",
    subtitle: "Track where your money comes from.",
    add: "Add income",
    search: "Search source or note…",
  },
  expense: {
    title: "Expenses",
    subtitle: "Record and manage your spending by category.",
    add: "Add expense",
    search: "Search notes…",
  },
};

/** The incomes and expenses pages: summary, filters, list, and add/edit/delete dialogs. */
export function TransactionsPage<K extends TransactionKind>({ kind }: { kind: K }) {
  const data = useTransactionsData(kind);
  const copy = COPY[kind];

  // null = closed; { item: null } = creating; { item } = editing that item.
  const [form, setForm] = useState<{ item: Transaction<K> | null } | null>(null);
  const [toDelete, setToDelete] = useState<Transaction<K> | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const hasCashAsset = data.cashAssets.length > 0;

  const handleSubmit = async (body: TransactionBody) => {
    const editing = form?.item;
    if (editing) {
      await data.updateMutation.mutateAsync({ uuid: editing.uuid, body });
    } else {
      await data.createMutation.mutateAsync(body);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{copy.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
            <Tags className="size-4" />
            Categories
          </Button>
          <Button onClick={() => setForm({ item: null })} disabled={!hasCashAsset}>
            <Plus className="size-4" />
            {copy.add}
          </Button>
        </div>
      </div>

      {!data.isLoading && !hasCashAsset && (
        <p className="text-muted-foreground text-sm">Add a CASH asset first to record {kind}s.</p>
      )}

      {data.error && <p className="text-destructive text-sm">{data.error.message}</p>}

      <TransactionSummaryCard
        kind={kind}
        summary={data.summary}
        isLoading={data.isSummaryLoading}
        activeCategory={data.filters.category}
        onCategoryClick={(uuid) => data.setFilters({ category: uuid || undefined })}
      />

      <TransactionFilters
        filters={data.filters}
        setFilters={data.setFilters}
        clearFilters={data.clearFilters}
        isFiltered={data.isFiltered}
        categories={data.categories}
        cashAssets={data.cashAssets}
        searchPlaceholder={copy.search}
      />

      <TransactionList
        kind={kind}
        items={data.items}
        categories={data.categories}
        isLoading={data.isLoading}
        isFiltered={data.isFiltered}
        onClearFilters={data.clearFilters}
        onEdit={(item) => setForm({ item })}
        onDelete={setToDelete}
      />

      {data.meta && (
        <Pagination
          page={data.filters.page}
          totalPages={data.meta.totalPages ?? 1}
          total={data.meta.total}
          limit={data.filters.limit}
          onPageChange={(page) => data.setFilters({ page })}
          disabled={data.isLoading}
        />
      )}

      <TransactionFormDialog
        kind={kind}
        open={form !== null}
        onOpenChange={(open) => !open && setForm(null)}
        item={form?.item ?? null}
        cashAssets={data.cashAssets}
        categories={data.categories}
        onSubmit={handleSubmit}
        isSubmitting={data.createMutation.isPending || data.updateMutation.isPending}
      />

      <CategoryManagerDialog
        type={categoryTypeOf(kind)}
        categories={data.categories}
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />

      <DeleteConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${kind}?`}
        description={
          kind === "income"
            ? "The amount is taken back out of its cash asset. This cannot be undone."
            : "The amount is returned to its cash asset. This cannot be undone."
        }
        onConfirm={async () => {
          if (!toDelete) return;
          // Failures are reported as a toast by the mutation.
          await data.deleteMutation.mutateAsync(toDelete.uuid).catch(() => undefined);
        }}
        isDeleting={data.deleteMutation.isPending}
      />
    </div>
  );
}
