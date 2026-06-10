import "server-only";

import { resolveStripeSecretKey } from "@/lib/admin/stripe/config";
import type {
  CreateStripePriceInput,
  CreateStripeProductInput,
  StripePriceRow,
  StripeProductRow,
  StripeRecurringInterval,
} from "@/lib/admin/stripe/types";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export class StripeApiError extends Error {
  readonly status: number;
  readonly stripeCode: string | null;

  constructor(message: string, status: number, stripeCode: string | null = null) {
    super(message);
    this.name = "StripeApiError";
    this.status = status;
    this.stripeCode = stripeCode;
  }
}

type StripeList<T> = {
  data: T[];
  has_more: boolean;
};

type RawStripeProduct = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, string>;
  default_price: string | { id: string } | null;
  created: number;
};

type RawStripePrice = {
  id: string;
  product: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  type: "one_time" | "recurring";
  recurring: { interval: StripeRecurringInterval; interval_count: number } | null;
  nickname: string | null;
};

function requireSecretKey(): string {
  const key = resolveStripeSecretKey();
  if (!key) {
    throw new StripeApiError(
      "Stripe is not configured. Set LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY.",
      503,
    );
  }
  return key;
}

async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const secretKey = requireSecretKey();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
  };

  let fetchBody: string | undefined;
  if (body) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      params.set(key, String(value));
    }
    fetchBody = params.toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method,
    headers,
    body: fetchBody,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as
    | T
    | { error?: { message?: string; code?: string } }
    | null;

  if (!response.ok) {
    const stripeMessage =
      json && typeof json === "object" && "error" in json
        ? json.error?.message ?? "Stripe request failed"
        : "Stripe request failed";
    const stripeCode =
      json && typeof json === "object" && "error" in json ? (json.error?.code ?? null) : null;
    throw new StripeApiError(stripeMessage, response.status, stripeCode);
  }

  return json as T;
}

function mapPrice(raw: RawStripePrice): StripePriceRow {
  return {
    id: raw.id,
    productId: raw.product,
    active: raw.active,
    currency: raw.currency,
    unitAmount: raw.unit_amount,
    type: raw.type,
    recurringInterval: raw.recurring?.interval ?? null,
    recurringIntervalCount: raw.recurring?.interval_count ?? null,
    nickname: raw.nickname,
  };
}

function mapProduct(raw: RawStripeProduct, prices: StripePriceRow[]): StripeProductRow {
  const defaultPriceId =
    typeof raw.default_price === "string"
      ? raw.default_price
      : raw.default_price?.id ?? null;

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    active: raw.active,
    suiteId: raw.metadata?.suite_id ?? null,
    metadata: raw.metadata ?? {},
    defaultPriceId,
    prices: prices.filter((p) => p.productId === raw.id),
    created: raw.created,
  };
}

async function listAllPrices(): Promise<StripePriceRow[]> {
  const rows: StripePriceRow[] = [];
  let startingAfter: string | undefined;

  for (let page = 0; page < 10; page += 1) {
    const query = new URLSearchParams({ limit: "100", active: "true" });
    if (startingAfter) query.set("starting_after", startingAfter);
    const batch = await stripeRequest<StripeList<RawStripePrice>>("GET", `/prices?${query.toString()}`);
    rows.push(...batch.data.map(mapPrice));
    if (!batch.has_more || batch.data.length === 0) break;
    startingAfter = batch.data[batch.data.length - 1]?.id;
  }

  return rows;
}

export async function listStripeCatalog(): Promise<StripeProductRow[]> {
  const [productBatch, prices] = await Promise.all([
    stripeRequest<StripeList<RawStripeProduct>>("GET", "/products?limit=100&active=true"),
    listAllPrices(),
  ]);

  const inactiveBatch = await stripeRequest<StripeList<RawStripeProduct>>(
    "GET",
    "/products?limit=100&active=false",
  ).catch(() => ({ data: [], has_more: false }));

  const allProducts = [...productBatch.data, ...inactiveBatch.data];
  return allProducts.map((raw) => mapProduct(raw, prices));
}

export async function createStripeProduct(input: CreateStripeProductInput): Promise<StripeProductRow> {
  const metadata: Record<string, string> = { ...(input.metadata ?? {}) };
  if (input.suiteId) metadata.suite_id = input.suiteId;

  const body: Record<string, string> = {
    name: input.name.trim(),
  };
  if (input.description?.trim()) body.description = input.description.trim();
  for (const [key, value] of Object.entries(metadata)) {
    body[`metadata[${key}]`] = value;
  }

  const raw = await stripeRequest<RawStripeProduct>("POST", "/products", body);
  return mapProduct(raw, []);
}

export async function createStripePrice(input: CreateStripePriceInput): Promise<StripePriceRow> {
  if (!Number.isInteger(input.unitAmountCents) || input.unitAmountCents <= 0) {
    throw new StripeApiError("Price amount must be a positive integer in cents.", 400);
  }

  const type = input.type ?? "recurring";
  const body: Record<string, string | number> = {
    product: input.productId,
    currency: (input.currency ?? "usd").toLowerCase(),
    unit_amount: input.unitAmountCents,
  };

  if (type === "recurring") {
    body["recurring[interval]"] = input.recurringInterval ?? "month";
    body["recurring[interval_count]"] = input.recurringIntervalCount ?? 1;
  } else {
    body.unit_amount = input.unitAmountCents;
  }

  if (input.nickname?.trim()) body.nickname = input.nickname.trim();

  const raw = await stripeRequest<RawStripePrice>("POST", "/prices", body);
  return mapPrice(raw);
}

export async function archiveStripeProduct(productId: string): Promise<StripeProductRow> {
  const raw = await stripeRequest<RawStripeProduct>("POST", `/products/${encodeURIComponent(productId)}`, {
    active: false,
  });
  return mapProduct(raw, []);
}

export async function linkSuiteToStripeProduct(
  suiteId: string,
  stripeProductId: string,
): Promise<StripeProductRow> {
  const raw = await stripeRequest<RawStripeProduct>(
    "POST",
    `/products/${encodeURIComponent(stripeProductId)}`,
    {
      "metadata[suite_id]": suiteId,
    },
  );
  return mapProduct(raw, []);
}

export async function getStripeProduct(productId: string): Promise<StripeProductRow | null> {
  try {
    const raw = await stripeRequest<RawStripeProduct>("GET", `/products/${encodeURIComponent(productId)}`);
    const prices = await listAllPrices();
    return mapProduct(raw, prices);
  } catch (err) {
    if (err instanceof StripeApiError && err.status === 404) return null;
    throw err;
  }
}
