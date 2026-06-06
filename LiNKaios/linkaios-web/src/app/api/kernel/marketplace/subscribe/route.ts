import { NextResponse } from "next/server";

import { subscribeSuiteFleet } from "@/lib/kernel/fleet/suite-subscribe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/kernel/marketplace/subscribe
 * Subscribe tenant to suite with fleet slot allocation (Wave 7.2 / 7.5).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const tenantId = String(body.tenant_id ?? "").trim();
  const tenantKind = body.tenant_kind === "admin" ? "admin" : "client";
  const suiteId = String(body.suite_id ?? "").trim();
  const moduleIds = Array.isArray(body.module_ids)
    ? (body.module_ids as unknown[]).map(String)
    : [];

  if (!tenantId || !suiteId) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: bindingRows, error: bindErr } = await supabase
    .schema("linkaios_kernel")
    .from("tenant_fleet_bindings")
    .select("openclaw_agent_id, slot_kind, suite_id, role_id")
    .eq("tenant_id", tenantId);

  if (bindErr) {
    return NextResponse.json({ ok: false, error: bindErr.message }, { status: 500 });
  }

  const existingBindings = (bindingRows ?? []).map((row) => ({
    openclawAgentId: String((row as { openclaw_agent_id: string }).openclaw_agent_id),
    slotKind: (row as { slot_kind: string }).slot_kind as "ceo" | "suite_head" | "suite_role",
    suiteId: (row as { suite_id?: string }).suite_id ?? undefined,
    roleId: (row as { role_id?: string }).role_id ?? undefined,
  }));

  const result = subscribeSuiteFleet({
    tenantId,
    tenantKind,
    suiteId,
    moduleIds,
    existingBindings,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  const newBindingsJson = result.newBindings.map((b) => ({
    openclaw_agent_id: b.openclawAgentId,
    slot_kind: b.slotKind,
    suite_id: b.suiteId ?? "",
    role_id: b.roleId ?? "",
  }));

  const { error: rpcErr } = await supabase.schema("linkaios_kernel").rpc("subscribe_suite_fleet", {
    p_tenant_id: tenantId,
    p_suite_id: suiteId,
    p_module_ids: moduleIds,
    p_new_bindings: newBindingsJson,
  });

  if (rpcErr) {
    return NextResponse.json({ ok: false, error: rpcErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, suite_id: suiteId, module_ids: moduleIds });
}
