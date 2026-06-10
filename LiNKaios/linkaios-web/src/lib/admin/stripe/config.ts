import "server-only";

/** Resolve Stripe secret key from GSM-style or generic env names. */
export function resolveStripeSecretKey(): string | null {
  const candidates = [
    process.env.LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY,
    process.env.STRIPE_SECRET_KEY,
  ];
  for (const raw of candidates) {
    const trimmed = raw?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

export function stripeConfigured(): boolean {
  return resolveStripeSecretKey() !== null;
}

export function stripeIsTestMode(secretKey: string): boolean {
  return secretKey.startsWith("sk_test_");
}
