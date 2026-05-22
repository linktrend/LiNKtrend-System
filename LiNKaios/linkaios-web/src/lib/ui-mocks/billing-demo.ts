/**
 * Demo billing fixtures for settings / billing MVO stub.
 */

import type { StatusTone } from "@/lib/status-colors";

export type BillingPaymentMethod = {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type BillingLinkaiosPlan = {
  name: string;
  priceUsd: number;
  interval: "month" | "year";
  status: "active" | "trialing" | "past_due";
  renewsAt: string;
  seatsIncluded: number;
  seatsUsed: number;
};

export type BillingInvoice = {
  id: string;
  number: string;
  issuedAt: string;
  dueAt: string | null;
  amountUsd: number;
  status: "paid" | "open" | "upcoming" | "void";
  summary: string;
};

export type BillingUpcomingCharge = {
  chargeDate: string;
  amountUsd: number;
  lineItems: { label: string; amountUsd: number }[];
};

export const BILLING_DEMO_PAYMENT_METHODS: BillingPaymentMethod[] = [
  { id: "pm_visa", brand: "Visa", last4: "4242", expMonth: 8, expYear: 2028, isDefault: true },
  { id: "pm_mc", brand: "Mastercard", last4: "8210", expMonth: 3, expYear: 2027, isDefault: false },
];

export const BILLING_DEMO_LINKAIOS_PLAN: BillingLinkaiosPlan = {
  name: "LiNKaios Professional",
  priceUsd: 149,
  interval: "month",
  status: "active",
  renewsAt: "2026-06-01T00:00:00.000Z",
  seatsIncluded: 10,
  seatsUsed: 4,
};

export const BILLING_DEMO_INVOICES: BillingInvoice[] = [
  {
    id: "inv_001",
    number: "INV-2026-0042",
    issuedAt: "2026-05-01T00:00:00.000Z",
    dueAt: "2026-05-15T00:00:00.000Z",
    amountUsd: 347.0,
    status: "open",
    summary: "LiNKaios Professional + LinkSites module",
  },
  {
    id: "inv_002",
    number: "INV-2026-0038",
    issuedAt: "2026-04-01T00:00:00.000Z",
    dueAt: null,
    amountUsd: 347.0,
    status: "paid",
    summary: "LiNKaios Professional + LinkSites module",
  },
  {
    id: "inv_003",
    number: "INV-2026-0031",
    issuedAt: "2026-03-01T00:00:00.000Z",
    dueAt: null,
    amountUsd: 298.0,
    status: "paid",
    summary: "LiNKaios Professional (trial ended)",
  },
];

export const BILLING_DEMO_UPCOMING: BillingUpcomingCharge = {
  chargeDate: "2026-06-01T00:00:00.000Z",
  amountUsd: 347.0,
  lineItems: [
    { label: "LiNKaios Professional (10 seats)", amountUsd: 149.0 },
    { label: "LinkSites — Professional", amountUsd: 149.0 },
    { label: "LEXOS Litigation — Starter (trial)", amountUsd: 49.0 },
  ],
};

export function billingInvoiceStatusDisplay(status: BillingInvoice["status"]): {
  label: "Paid" | "Unpaid";
  tone: StatusTone;
} {
  if (status === "paid") {
    return { label: "Paid", tone: "success" };
  }
  return { label: "Unpaid", tone: "danger" };
}

export function formatBillingUsd(amount: number): string {
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function formatBillingDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
