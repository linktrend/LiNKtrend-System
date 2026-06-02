import { NextResponse } from "next/server";

import { proposeLibrarianKnowledge, librarianCronEnabled, listRunsPendingLibrarianIngest } from "../../../../../../../LiNKbrain/librarian/persistence";
import { loadEnv } from "@linktrend/shared-config";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

function authorizeCron(req: Request): boolean {
  const secrets = [process.env.LINKAIOS_CRON_SECRET, process.env.CRON_SECRET].filter(Boolean) as string[];
  if (!secrets.length) return false;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return Boolean(token && secrets.includes(token));
}

function librarianDisabled(): boolean {
  loadEnv();
  return !librarianCronEnabled();
}

/**
 * Librarian cron: ingest completed LinkSites runs → pending knowledge proposals (LTS-021).
 */
export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (librarianDisabled()) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      skipped: true,
      message: "LINKBRAIN_LIBRARIAN_ENABLED=0 — librarian cron disabled.",
    });
  }

  const maxRaw = process.env.LINKBRAIN_LIBRARIAN_MAX_FILES?.trim();
  const maxRuns = maxRaw ? Math.min(100, Math.max(1, Number.parseInt(maxRaw, 10) || 5)) : 5;

  const admin = getSupabaseAdmin();
  const { data: tenants, error: tenantErr } = await admin
    .schema("linkaios_kernel")
    .from("tenants")
    .select("tenant_id, slug")
    .limit(50);

  if (tenantErr) {
    return NextResponse.json({ ok: false, error: tenantErr.message }, { status: 500 });
  }

  const processed: Array<{
    tenant_id: string;
    tenant_slug: string | null;
    run_id: string;
    proposal_id: string;
    brain_file_version_id: string;
  }> = [];

  for (const tenant of tenants ?? []) {
    const tenantId = String((tenant as { tenant_id: string }).tenant_id);
    const tenantSlug = (tenant as { slug?: string }).slug ?? null;
    let pending: Awaited<ReturnType<typeof listRunsPendingLibrarianIngest>>;
    try {
      pending = await listRunsPendingLibrarianIngest(admin, tenantId, maxRuns);
    } catch (error) {
      const message = error instanceof Error ? error.message : "list pending runs failed";
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

    for (const run of pending) {
      if (processed.length >= maxRuns) break;
      try {
        const result = await proposeLibrarianKnowledge(admin, {
          tenant_id: tenantId,
          run_id: run.run_id,
          stage_id: "linksites.librarian",
          project_id: run.project_id ?? undefined,
          run_outputs: [
            {
              ref: `audit://run/${run.run_id}/completed`,
              summary: "LinkSites run completed — librarian ingest from cron",
            },
          ],
          zulip_thread_refs: [
            {
              stream: "linksites",
              topic: `run-${run.run_id.slice(0, 8)}-librarian`,
            },
          ],
        });
        processed.push({
          tenant_id: tenantId,
          tenant_slug: tenantSlug,
          run_id: run.run_id,
          proposal_id: result.proposal.proposal_id,
          brain_file_version_id: result.brain_file_version_id,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "propose failed";
        return NextResponse.json(
          { ok: false, error: message, partial: processed },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    processed: processed.length,
    proposals: processed,
  });
}

export async function GET(req: Request) {
  return POST(req);
}
