import { NextResponse } from "next/server";

import { isVendorAdminActor, resolveLinksuitegenAdminActor } from "@/lib/admin/linksuitegen/admin-auth";
import { listMarketplacePlugins } from "@/lib/admin/linksuitegen/store";

/** DB-backed marketplace catalogue (Wave 6.4) — replaces demo localStorage for published suites. */
export async function GET(req: Request) {
  const actor = await resolveLinksuitegenAdminActor(req);
  if (!isVendorAdminActor(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const plugins = await listMarketplacePlugins();
  return NextResponse.json({ ok: true, plugins });
}
