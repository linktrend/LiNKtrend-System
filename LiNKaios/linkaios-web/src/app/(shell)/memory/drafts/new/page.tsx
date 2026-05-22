import Link from "next/link";

import { NewBrainDraftForm } from "@/components/linkbrain/new-brain-draft-form";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_BRAIN_AGENTS } from "@/lib/ui-mocks/linkbrain-demo-agents";

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
  const uiMocksEnabled = isUiMocksEnabled();
  const [{ data: missionRows }, { data: agentRows }, { data: legalRows, error: legalErr }] = await Promise.all([
    supabase.schema("linkaios").from("missions").select("id, title").order("title", { ascending: true }).limit(300),
    supabase.schema("linkaios").from("agents").select("id, display_name").order("display_name", { ascending: true }).limit(300),
    listBrainLegalEntities(supabase),
  ]);

  const missions = (missionRows ?? []) as { id: string; title: string }[];
  const agentsFromDb = (agentRows ?? []) as { id: string; display_name: string }[];
  const agents =
    uiMocksEnabled && agentsFromDb.length < 2
      ? [...DEMO_BRAIN_AGENTS.map((a) => ({ id: a.id, display_name: a.display_name })), ...agentsFromDb]
      : agentsFromDb;
  const legalEntities = legalRows ?? [];

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <ShellPageHeaderClient
        title="Add Knowledge"
        subtitle="Creates a draft in Inbox — it is not recorded in LiNKbrain until an operator approves."
       
      />

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
        <Link href="/memory?tab=inbox" className="text-sky-700 underline dark:text-sky-400">
          Back to Inbox
        </Link>
      </p>
    </main>
  );
}
