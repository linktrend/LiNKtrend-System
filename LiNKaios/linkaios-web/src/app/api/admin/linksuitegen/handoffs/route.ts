import { NextResponse } from "next/server";

import { isVendorAdminActor, resolveLinksuitegenAdminActor } from "@/lib/admin/linksuitegen/admin-auth";
import { importHandoff } from "@/lib/admin/linksuitegen/handoff-service";
import type { HandoffImportBody } from "@/lib/admin/linksuitegen/types";
import {
  publishHandoffToMarketplace,
  type LinksuitegenHandoffInput,
} from "@/lib/kernel/marketplace/handoff-publish";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function toHandoffInput(body: HandoffImportBody): LinksuitegenHandoffInput {
  return {
    handoff_id: body.handoff_id,
    schema_version: body.schema_version,
    suite_id: body.suite_id,
    suite_family: body.suite_family,
    suite_version: body.suite_version,
    bundle_path: body.bundle_path,
    validation_status: body.validation_status as LinksuitegenHandoffInput["validation_status"],
    display_name: body.display_name,
    admin_install_target: body.admin_install_target,
  };
}

/**
 * POST /api/admin/linksuitegen/handoffs
 * Receives LiNKsuitegen export bundles — candidate store + marketplace DB publish.
 */
export async function POST(req: Request) {
  const actor = await resolveLinksuitegenAdminActor(req);
  if (!isVendorAdminActor(actor)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as HandoffImportBody | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const candidate = await importHandoff(body);

    let marketplace: Awaited<ReturnType<typeof publishHandoffToMarketplace>> | null = null;
    if (body.validation_status === "validated") {
      const supabase = getSupabaseAdmin();
      marketplace = await publishHandoffToMarketplace(supabase, toHandoffInput(body));
    }

    return NextResponse.json({
      ok: true,
      candidate_id: candidate.candidate_id,
      status: candidate.status,
      marketplace,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }
}
