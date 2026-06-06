import { NextResponse } from "next/server";

import { isVendorAdminActor, resolveLinksuitegenAdminActor } from "@/lib/admin/linksuitegen/admin-auth";
import { getCandidate } from "@/lib/admin/linksuitegen/store";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ candidateId: string }> },
) {
  const actor = await resolveLinksuitegenAdminActor(req);
  if (!isVendorAdminActor(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { candidateId } = await ctx.params;
  const candidate = await getCandidate(candidateId);
  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, candidate });
}
