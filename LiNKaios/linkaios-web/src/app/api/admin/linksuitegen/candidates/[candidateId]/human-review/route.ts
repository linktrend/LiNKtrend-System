import { NextResponse } from "next/server";

import { isVendorAdminActor, resolveLinksuitegenAdminActor } from "@/lib/admin/linksuitegen/admin-auth";
import { recordHumanReview } from "@/lib/admin/linksuitegen/candidate-lifecycle";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ candidateId: string }> },
) {
  const actor = await resolveLinksuitegenAdminActor(req);
  if (!isVendorAdminActor(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { candidateId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const decision = body.decision as "approved" | "changes_requested" | "rejected" | undefined;
  if (!decision) {
    return NextResponse.json({ error: "Missing decision" }, { status: 400 });
  }
  try {
    const candidate = await recordHumanReview({
      candidate_id: candidateId,
      reviewer_id: "vendor-admin",
      decision,
      decision_notes: typeof body.decision_notes === "string" ? body.decision_notes : "",
    });
    return NextResponse.json({ ok: true, candidate });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
