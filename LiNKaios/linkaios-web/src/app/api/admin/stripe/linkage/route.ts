import { NextResponse } from "next/server";

import { linkSuiteToStripeProduct } from "@/lib/admin/stripe/client";
import { resolveStripeSecretKey, stripeIsTestMode } from "@/lib/admin/stripe/config";
import { stripeProductDashboardUrl } from "@/lib/admin/stripe/dashboard-url";
import { withStripeProductManagementGovernance } from "@/lib/admin/stripe/governance";
import { parseLinkSuiteBody } from "@/lib/admin/stripe/parse-request";
import { assertStripeAdminWriter, stripeErrorResponse } from "@/lib/admin/stripe-auth";

/** PATCH /api/admin/stripe/linkage — set suite_id metadata on a Stripe product. */
export async function PATCH(req: Request) {
  const auth = await assertStripeAdminWriter();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const input = parseLinkSuiteBody(body);
  if (!input) {
    return NextResponse.json(
      { error: "Invalid linkage payload — suiteId and stripeProductId required." },
      { status: 400 },
    );
  }

  try {
    const { result, governance } = await withStripeProductManagementGovernance(
      "stripe.product.link_suite",
      { ...input, requestedBy: auth.userId },
      () => linkSuiteToStripeProduct(input.suiteId, input.stripeProductId),
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
