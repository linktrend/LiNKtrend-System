import { notFound } from "next/navigation";

import { AgentSkillsTable } from "@/components/agent-skills-table";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { DEMO_AGENT_SKILLS, MOCK_UI_AGENT_SKILLS_ROWS } from "@/lib/ui-mocks/worker-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerSkillsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (isDemoAgentId(id)) {
    const rows = DEMO_AGENT_SKILLS[id] ?? [];
    return (
      <section className="space-y-4">
        <WorkerTabSectionHeader
          title="LiNKskills"
          subtitle="Skills and tools assigned to this LiNKbot (not the company-wide catalog). Toggle is local demo state."
        />
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">No demo skills for this id.</p>
        ) : (
          <AgentSkillsTable rows={rows} />
        )}
      </section>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error } = await supabase.schema("linkaios").from("agents").select("id").eq("id", id).maybeSingle();
  if (error || !agent) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <WorkerTabSectionHeader
        title="LiNKskills"
        subtitle="Skills assigned to this LiNKbot (preview rows for layout review)."
      />
      <AgentSkillsTable rows={MOCK_UI_AGENT_SKILLS_ROWS} />
    </section>
  );
}
