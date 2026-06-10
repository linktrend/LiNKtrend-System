import type {
  CreateStripePriceInput,
  CreateStripeProductInput,
  StripeRecurringInterval,
} from "@/lib/admin/stripe/types";

const RECURRING_INTERVALS = new Set<StripeRecurringInterval>(["day", "week", "month", "year"]);

export function parseCreateProductBody(body: unknown): CreateStripeProductInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) return null;

  const description = typeof record.description === "string" ? record.description : undefined;
  const suiteId =
    typeof record.suiteId === "string" && record.suiteId.trim()
      ? record.suiteId.trim()
      : record.suiteId === null
        ? null
        : undefined;

  return { name, description, suiteId };
}

export function parseCreatePriceBody(body: unknown): CreateStripePriceInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const productId = typeof record.productId === "string" ? record.productId.trim() : "";
  if (!productId) return null;

  const amountMajor = typeof record.amount === "number" ? record.amount : Number(record.amount);
  if (!Number.isFinite(amountMajor) || amountMajor <= 0) return null;

  const unitAmountCents = Math.round(amountMajor * 100);
  const currency = typeof record.currency === "string" ? record.currency : "usd";
  const type = record.type === "one_time" ? "one_time" : "recurring";

  let recurringInterval: StripeRecurringInterval | undefined;
  if (typeof record.recurringInterval === "string" && RECURRING_INTERVALS.has(record.recurringInterval as StripeRecurringInterval)) {
    recurringInterval = record.recurringInterval as StripeRecurringInterval;
  }

  const recurringIntervalCount =
    typeof record.recurringIntervalCount === "number" && record.recurringIntervalCount >= 1
      ? Math.floor(record.recurringIntervalCount)
      : undefined;

  const nickname = typeof record.nickname === "string" ? record.nickname : undefined;

  return {
    productId,
    unitAmountCents,
    currency,
    type,
    recurringInterval,
    recurringIntervalCount,
    nickname,
  };
}

export function parseLinkSuiteBody(body: unknown): { suiteId: string; stripeProductId: string } | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const suiteId = typeof record.suiteId === "string" ? record.suiteId.trim() : "";
  const stripeProductId = typeof record.stripeProductId === "string" ? record.stripeProductId.trim() : "";
  if (!suiteId || !stripeProductId) return null;
  return { suiteId, stripeProductId };
}
