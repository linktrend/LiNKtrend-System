/** Build Stripe Dashboard deep link for a product (test vs live inferred from secret prefix). */
export function stripeProductDashboardUrl(productId: string, isTestMode: boolean): string {
  const base = isTestMode ? "https://dashboard.stripe.com/test" : "https://dashboard.stripe.com";
  return `${base}/products/${encodeURIComponent(productId)}`;
}
