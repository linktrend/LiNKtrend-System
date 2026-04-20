import Link from "next/link";

import { NewBrainDraftForm } from "@/components/linkbrain/new-brain-draft-form";
import { PageIntro } from "@/components/page-intro";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { listBrainLegalEntities, type BrainScope } from "@linktrend/linklogic-sdk";

export const dynamic = "force-dynamic";

function parseScope(v: string | null): BrainScope {
  if (v === "mission" || v === "agent") return v;
  return "company";
}

export default async function NewBrainDraftPage(props: {
  searchParams: Promise<{
    scope?: string;
    logicalPath?: string;
    missionId?: string;
    agentId?: string;
    err?: string;
  }>;
}) {
  const sp = await props.searchParams;
  const scope = parseScope(sp.scope ?? null);
  const logicalPath = sp.logicalPath?.trim() ?? "";
  const missionId = sp.missionId?.trim() ?? "";
  const agentId = sp.agentId?.trim() ?? "";

  const supabase = await createSupabaseServerClient();
  const [{ data: missionRows }, { data: agentRows }, { data: legalRows, error: legalErr }] = await Promise.all([
    supabase.schema("linkaios").from("missions").select("id, title").order("title", { ascending: true }).limit(300),
    supabase.schema("linkaios").from("agents").select("id, display_name").order("display_name", { ascending: true }).limit(300),
    listBrainLegalEntities(supabase),
  ]);

  const missions = (missionRows ?? []) as { id: string; title: string }[];
  const agents = (agentRows ?? []) as { id: string; display_name: string }[];
  const legalEntities = legalRows ?? [];

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">New virtual-file draft</h1>
        <PageIntro className="mt-2">
          Creates the Supabase row for this path if needed, then opens a draft version. Publishing replaces the prior
          published body for the same path and scope. <strong>Project</strong> scope is stored as a mission record in
          the database (same id you pick below).
        </PageIntro>
      </div>

      {sp.err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {(() => {
            try {
              return decodeURIComponent(sp.err);
            } catch {
              return sp.err;
            }
          })()}
        </p>
      ) : null}

      {legalErr ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Legal entities could not be loaded ({legalErr.message}). Apply migration 015, then refresh.
        </p>
      ) : null}

      <NewBrainDraftForm
        defaultScope={scope}
        defaultLogicalPath={logicalPath}
        defaultMissionId={missionId}
        defaultAgentId={agentId}
        missions={missions}
        agents={agents}
        legalEntities={legalEntities}
      />

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/memory?tab=project" className="text-sky-700 underline dark:text-sky-400">
          Back to LiNKbrain
        </Link>
      </p>
    </main>
  );
}
