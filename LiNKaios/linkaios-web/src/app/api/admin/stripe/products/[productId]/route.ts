import { NextResponse } from "next/server";

import { archiveStripeProduct } from "@/lib/admin/stripe/client";
import { resolveStripeSecretKey, stripeIsTestMode } from "@/lib/admin/stripe/config";
import { stripeProductDashboardUrl } from "@/lib/admin/stripe/dashboard-url";
import { withStripeProductManagementGovernance } from "@/lib/admin/stripe/governance";
import { assertStripeAdminWriter, stripeErrorResponse } from "@/lib/admin/stripe-auth";

type RouteContext = { params: Promise<{ productId: string }> };

/** POST /api/admin/stripe/products/[productId] — archive product (active=false). */
export async function POST(_req: Request, context: RouteContext) {
  const auth = await assertStripeAdminWriter();
  if (!auth.ok) return auth.response;

  const { productId } = await context.params;
  if (!productId?.trim()) {
    return NextResponse.json({ error: "Product ID required." }, { status: 400 });
  }

  try {
    const { result, governance } = await withStripeProductManagementGovernance(
      "stripe.product.archive",
      { productId, requestedBy: auth.userId },
      () => archiveStripeProduct(productId),
    );
    const secret = resolveStripeSecretKey()!;
    return NextResponse.json({
      ok: true,
      product: result,
      governance,
      dashboardUrl: stripeProductDashboardUrl(result.id, stripeIsTestMode(secret)),
    });
  } catch (err) {
    return stripeErrorResponse(err);
  }
}
