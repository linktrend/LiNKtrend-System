import { notFound } from "next/navigation";

import { WorkerLifecyclePanel } from "@/components/worker-lifecycle-panel";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerLifecyclePage(props: { params: Promise<{ id: string }> }) {
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
        title="Lifecycle"
        subtitle={`Suspend, terminate, or request deletion for ${displayName}. Super Admins on the licensee side and platform operators on the licensor side use this tab.`}
      />
      <WorkerLifecyclePanel agentId={id} displayName={displayName} />
    </section>
  );
}
