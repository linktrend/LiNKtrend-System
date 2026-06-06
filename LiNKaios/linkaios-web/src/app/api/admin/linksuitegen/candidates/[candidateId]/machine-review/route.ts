import { NextResponse } from "next/server";

import { isVendorAdminActor, resolveLinksuitegenAdminActor } from "@/lib/admin/linksuitegen/admin-auth";
import { runMachineReview } from "@/lib/admin/linksuitegen/candidate-lifecycle";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ candidateId: string }> },
) {
  const actor = await resolveLinksuitegenAdminActor(req);
  if (!isVendorAdminActor(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { candidateId } = await ctx.params;
  try {
    const result = await runMachineReview(candidateId);
    return NextResponse.json({ ok: true, ...result, event: "linksuitegen.machine_review.completed" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
