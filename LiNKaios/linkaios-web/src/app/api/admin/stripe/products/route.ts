import { NextResponse } from "next/server";

import {
  archiveStripeProduct,
  createStripePrice,
  createStripeProduct,
  linkSuiteToStripeProduct,
  listStripeCatalog,
} from "@/lib/admin/stripe/client";
import { stripeConfigured, stripeIsTestMode, resolveStripeSecretKey } from "@/lib/admin/stripe/config";
import { stripeProductDashboardUrl } from "@/lib/admin/stripe/dashboard-url";
import { withStripeProductManagementGovernance } from "@/lib/admin/stripe/governance";
import {
  parseCreatePriceBody,
  parseCreateProductBody,
  parseLinkSuiteBody,
} from "@/lib/admin/stripe/parse-request";
import { assertStripeAdminWriter, stripeErrorResponse } from "@/lib/admin/stripe-auth";

/** GET /api/admin/stripe/products — list Stripe catalog for Admin UI. */
export async function GET() {
  const auth = await assertStripeAdminWriter();
  if (!auth.ok) return auth.response;

  if (!stripeConfigured()) {
    return NextResponse.json({
      ok: true,
      configured: false,
      products: [],
      dashboardMode: "test" as const,
    });
  }

  try {
    const products = await listStripeCatalog();
    const secret = resolveStripeSecretKey()!;
    return NextResponse.json({
      ok: true,
      configured: true,
      products,
      dashboardMode: stripeIsTestMode(secret) ? "test" : "live",
    });
  } catch (err) {
    return stripeErrorResponse(err);
  }
}

/** POST /api/admin/stripe/products — create Stripe product. */
export async function POST(req: Request) {
  const auth = await assertStripeAdminWriter();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const input = parseCreateProductBody(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid product payload — name is required." }, { status: 400 });
  }

  try {
    const { result, governance } = await withStripeProductManagementGovernance(
      "stripe.product.create",
      { name: input.name, suiteId: input.suiteId ?? null, requestedBy: auth.userId },
      () => createStripeProduct(input),
    );
    const secret = resolveStripeSecretKey()!;
    return NextResponse.json(
      {
        ok: true,
        product: result,
        governance,
        dashboardUrl: stripeProductDashboardUrl(result.id, stripeIsTestMode(secret)),
      },
      { status: 201 },
    );
  } catch (err) {
    return stripeErrorResponse(err);
  }
}
