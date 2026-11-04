import type { ObligationKind } from "@/lib/api/obligations";

export interface ObligationCopy {
  title: string;
  subtitle: string;
  noun: string;
  add: string;
  party: string;
  partyPlaceholder: string;
  outstanding: string;
  paid: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Asset picker on the create/edit form, and what choosing one does to its balance. */
  openAsset: string;
  openAssetHint: string;
  recordPayment: string;
  paymentAsset: string;
  paymentAssetHint: string;
  deleteDescription: string;
}

export const OBLIGATION_COPY: Record<ObligationKind, ObligationCopy> = {
  debt: {
    title: "Debts",
    subtitle: "Money you owe other people. Record repayments as you pay them back.",
    noun: "debt",
    add: "Add debt",
    party: "Lender",
    partyPlaceholder: "Who you borrowed from",
    outstanding: "You still owe",
    paid: "Paid",
    emptyTitle: "No debts",
    emptyDescription: "Add a debt to keep track of money you borrowed.",
    openAsset: "Received into (optional)",
    openAssetHint: "The borrowed amount is added to this cash asset. Leave it empty to only keep a record.",
    recordPayment: "Record repayment",
    paymentAsset: "Paid from (optional)",
    paymentAssetHint: "The payment is taken out of this cash asset.",
    deleteDescription:
      "Its repayments are deleted too, and any cash movement they made is reversed. This cannot be undone.",
  },
  receivable: {
    title: "Receivables",
    subtitle: "Money other people owe you. Record what they pay back.",
    noun: "receivable",
    add: "Add receivable",
    party: "Borrower",
    partyPlaceholder: "Who borrowed from you",
    outstanding: "Still owed to you",
    paid: "Received",
    emptyTitle: "No receivables",
    emptyDescription: "Add a receivable to keep track of money you lent.",
    openAsset: "Lent from (optional)",
    openAssetHint: "The lent amount is taken out of this cash asset. Leave it empty to only keep a record.",
    recordPayment: "Record repayment",
    paymentAsset: "Received into (optional)",
    paymentAssetHint: "The repayment is added to this cash asset.",
    deleteDescription:
      "Its repayments are deleted too, and any cash movement they made is reversed. This cannot be undone.",
  },
};
