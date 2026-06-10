import "server-only";

import { NextResponse } from "next/server";

import { getAppRoleTierForUser, isCommandCentreAdmin } from "@/lib/command-centre-access";
import { isLicensorOperator } from "@/lib/licensor-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StripeAdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/** Licensor Admin or Super Admin required for Stripe catalog writes. */
export async function assertStripeAdminWriter(): Promise<StripeAdminAuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isLicensorOperator(user.email)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const [isAdmin, role] = await Promise.all([
    isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }),
    getAppRoleTierForUser(supabase, { userId: user.id, email: user.email }),
  ]);

  if (!isAdmin || (role !== "admin" && role !== "super_admin")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden — Admin or Super Admin required" }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id };
}

export function stripeErrorResponse(err: unknown): NextResponse {
  if (err instanceof Error && err.name === "StripeApiError") {
    const stripeErr = err as { status?: number; message: string };
    return NextResponse.json({ error: stripeErr.message }, { status: stripeErr.status ?? 502 });
  }
  const message = err instanceof Error ? err.message : "Stripe operation failed";
  return NextResponse.json({ error: message }, { status: 500 });
}
