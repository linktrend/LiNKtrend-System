export type StripeRecurringInterval = "day" | "week" | "month" | "year";

export type StripeProductRow = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  suiteId: string | null;
  metadata: Record<string, string>;
  defaultPriceId: string | null;
  prices: StripePriceRow[];
  created: number;
};

export type StripePriceRow = {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  unitAmount: number | null;
  type: "one_time" | "recurring";
  recurringInterval: StripeRecurringInterval | null;
  recurringIntervalCount: number | null;
  nickname: string | null;
};

export type CreateStripeProductInput = {
  name: string;
  description?: string;
  suiteId?: string | null;
  metadata?: Record<string, string>;
};

export type CreateStripePriceInput = {
  productId: string;
  unitAmountCents: number;
  currency?: string;
  type?: "one_time" | "recurring";
  recurringInterval?: StripeRecurringInterval;
  recurringIntervalCount?: number;
  nickname?: string;
};

export type LinkSuiteStripeProductInput = {
  suiteId: string;
  stripeProductId: string;
};
