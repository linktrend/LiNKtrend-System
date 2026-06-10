import type { StripePriceRow, StripeRecurringInterval } from "@/lib/admin/stripe/types";

/** Convert major currency units (e.g. dollars) to Stripe cents. */
export function majorUnitsToCents(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a non-negative number.");
  }
  return Math.round(amount * 100);
}

/** Format Stripe cents for display (e.g. 1999 → "19.99"). */
export function formatStripeAmount(cents: number | null, currency: string): string {
  if (cents === null) return "—";
  const major = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(major);
  } catch {
    return `${major.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function formatBillingFrequency(price: Pick<
  StripePriceRow,
  "type" | "recurringInterval" | "recurringIntervalCount"
>): string {
  if (price.type === "one_time") return "One-time";
  const count = price.recurringIntervalCount ?? 1;
  const interval = price.recurringInterval ?? "month";
  if (count === 1) {
    return intervalLabel(interval);
  }
  return `Every ${count} ${interval}${count > 1 ? "s" : ""}`;
}

function intervalLabel(interval: StripeRecurringInterval): string {
  switch (interval) {
    case "day":
      return "Daily";
    case "week":
      return "Weekly";
    case "month":
      return "Monthly";
    case "year":
      return "Annual";
    default: {
      const _exhaustive: never = interval;
      return _exhaustive;
    }
  }
}
