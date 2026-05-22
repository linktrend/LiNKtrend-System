import { notFound } from "next/navigation";

import { WorkerLogsPanel } from "@/components/worker-logs-panel";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerLogsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  let displayName = id;

  if (isDemoAgentId(id)) {
    displayName = id === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";
  } else {
    const supabase = await createSupabaseServerClient();
    const { data: agent, error } = await supabase
      .schema("linkaios")
      .from("agents")
      .select("id, display_name")
      .eq("id", id)
      .maybeSingle();

    if (error || !agent) {
      notFound();
    }

    displayName = String((agent as { display_name: string }).display_name);
  }

  return (
    <section className="space-y-4">
      <WorkerTabSectionHeader
        title="Logs"
        subtitle={`Closed session transcripts for ${displayName} — OpenClaw-style JSONL logs with message counts, tool usage, and cost per ended session.`}
      />
      <WorkerLogsPanel agentId={id} />
    </section>
  );
}
