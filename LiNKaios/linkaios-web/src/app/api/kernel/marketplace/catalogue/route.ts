import { NextResponse } from "next/server";

import { loadMarketplaceCatalogue } from "@/lib/kernel/marketplace/catalogue";
import { isSuiteVisibleInMarketplace } from "@/lib/kernel/fleet/studio-tenant-seed";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/kernel/marketplace/catalogue
 * DB-backed marketplace suite list (Wave 6.4).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenantSlug = url.searchParams.get("tenant_slug");

  try {
    const supabase = getSupabaseAdmin();
    const items = await loadMarketplaceCatalogue(supabase);
    const visible = items.filter((item) => isSuiteVisibleInMarketplace(item.id, tenantSlug));
    return NextResponse.json({ ok: true, items: visible });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
