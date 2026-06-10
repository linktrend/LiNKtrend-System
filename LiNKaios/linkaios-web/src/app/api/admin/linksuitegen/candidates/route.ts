import { NextResponse } from "next/server";

import { isVendorAdminActor, resolveLinksuitegenAdminActor } from "@/lib/admin/linksuitegen/admin-auth";
import { listCandidates } from "@/lib/admin/linksuitegen/store";

export async function GET(req: Request) {
  const actor = await resolveLinksuitegenAdminActor(req);
  if (!isVendorAdminActor(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const candidates = await listCandidates();
  return NextResponse.json({ ok: true, candidates });
}
