import { NextResponse } from "next/server";

import { createStripePrice } from "@/lib/admin/stripe/client";
import { withStripeProductManagementGovernance } from "@/lib/admin/stripe/governance";
import { parseCreatePriceBody } from "@/lib/admin/stripe/parse-request";
import { assertStripeAdminWriter, stripeErrorResponse } from "@/lib/admin/stripe-auth";

/** POST /api/admin/stripe/prices — create Stripe price (immutable amount). */
export async function POST(req: Request) {
  const auth = await assertStripeAdminWriter();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const input = parseCreatePriceBody(body);
  if (!input) {
    return NextResponse.json(
      { error: "Invalid price payload — productId and positive amount required." },
      { status: 400 },
    );
  }

  try {
    const { result, governance } = await withStripeProductManagementGovernance(
      "stripe.price.create",
      {
        productId: input.productId,
        unitAmountCents: input.unitAmountCents,
        type: input.type ?? "recurring",
        requestedBy: auth.userId,
      },
      () => createStripePrice(input),
    );
    return NextResponse.json({ ok: true, price: result, governance }, { status: 201 });
  } catch (err) {
    return stripeErrorResponse(err);
  }
}
