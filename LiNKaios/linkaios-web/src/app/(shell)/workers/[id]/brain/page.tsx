import Link from "next/link";
import { notFound } from "next/navigation";

import { LinkbrainMemoryDocList } from "@/components/linkbrain/linkbrain-memory-doc-row";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { loadLinkbrainPageData } from "@/lib/linkbrain-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoBrainAgentSlugForId, resolveDemoBrainAgentId } from "@/lib/ui-mocks/linkbrain-demo-agents";
import { applyLinkbrainUiMockOverlay } from "@/lib/ui-mocks/linkbrain-demo-overlay";
import { BUTTON } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

export default async function WorkerBrainPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const uiMocksEnabled = isUiMocksEnabled();

  let displayName = id;
  let brainAgentId = id;
  let memoryAgentParam = id;

  if (isDemoAgentId(id)) {
    displayName = id === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";
    brainAgentId = resolveDemoBrainAgentId(id) ?? id;
    memoryAgentParam = demoBrainAgentSlugForId(brainAgentId) ?? id;
  } else {
    const supabase = await createSupabaseServerClient();
    const { data: agent, error } = await supabase.schema("linkaios").from("agents").select("id, display_name").eq("id", id).maybeSingle();
    if (error || !agent) {
      notFound();
    }
    displayName = String((agent as { display_name: string }).display_name);
    brainAgentId = id;
    memoryAgentParam = id;
  }

  const supabase = await createSupabaseServerClient();
  let data = await loadLinkbrainPageData(supabase, {
    tab: "agent",
    agentId: brainAgentId,
    brainAgentId,
    scope: "recent",
    brainScope: "agent",
  });

  if (uiMocksEnabled && !data.error) {
    data = applyLinkbrainUiMockOverlay(data, { tab: "agent", brainAgentId });
  }

  const agentTitle = data.agents.find((a) => a.id === brainAgentId)?.display_name ?? displayName;
  const memoryHref = `/memory?tab=agent&agent=${encodeURIComponent(memoryAgentParam)}`;

  return (
    <div className="space-y-6">
      <WorkerTabSectionHeader
        title="LiNKbrain"
        subtitle={`Approved memory and personality files for ${displayName} — same layout as LiNKbrain → LiNKbot Memory, pre-scoped to this agent. Persona layers (base persona, soul, identity) and daily logs are governed documents in the agent partition. Edit proposals flow through LiNKbrain Inbox before publish.`}
        actions={
          <>
            <Link href={memoryHref} className={`${BUTTON.secondaryRow} h-fit shrink-0`}>
              Open in LiNKbrain
            </Link>
            <Link href="/skills/skills" className={`${BUTTON.secondaryRow} h-fit shrink-0`}>
              Open in LiNKskills
            </Link>
          </>
        }
      />

      {data.brainMetaError || data.orgMetaError ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError ?? data.orgMetaError}</p>
      ) : null}

      {data.error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{data.error}</p>
      ) : (
        <LinkbrainMemoryDocList files={data.brainPartitionFiles} scopeLabel={agentTitle} agentId={brainAgentId} />
      )}
    </div>
  );
}
