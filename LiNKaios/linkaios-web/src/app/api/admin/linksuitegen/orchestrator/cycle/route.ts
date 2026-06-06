import { NextResponse } from "next/server";

import { authorizeAdminServiceToken, linksuitegenApiBaseUrl } from "@/lib/admin/authorize-service";

/**
 * POST /api/admin/linksuitegen/orchestrator/cycle
 * Proxies to LiNKsuitegen Factory API (Wave 6.2 / 10.1).
 */
export async function POST(req: Request) {
  if (!authorizeAdminServiceToken(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.text();
  const base = linksuitegenApiBaseUrl();
  const variant = process.env.LINKSUITEGEN_DISCOVERY_VARIANT?.trim() || "simple_crm_lead_odoo_shadow";

  let payload: Record<string, unknown> = { variant };
  if (body.trim()) {
    try {
      payload = { ...payload, ...(JSON.parse(body) as Record<string, unknown>) };
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
  }

  try {
    const res = await fetch(`${base}/v1/orchestrator/cycle`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(300_000),
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 4000) };
    }
    return NextResponse.json(json, { status: res.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
