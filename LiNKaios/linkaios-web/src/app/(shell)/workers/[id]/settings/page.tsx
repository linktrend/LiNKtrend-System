import Link from "next/link";

import { WorkerLifecyclePanel } from "@/components/worker-lifecycle-panel";
import { WorkerRoleAwareSettingsForm } from "@/components/worker-role-aware-forms";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { TYPE, WORKER_DETAIL } from "@/lib/ui-standards";
import { parseRuntimeSettings } from "@/lib/agent-runtime-settings";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { demoAgentRuntimeSettings } from "@/lib/ui-mocks/worker-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerSettingsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (isDemoAgentId(id)) {
    const initial = demoAgentRuntimeSettings(id);
    const displayName = id === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";
    return (
      <section className="space-y-4">
        <WorkerTabSectionHeader
          title="Settings"
          subtitle="Profile, LiNKbrain personality files, runtime policy, and lifecycle controls for this LiNKbot."
        />
        <WorkerRoleAwareSettingsForm
          agentId={id}
          displayName={displayName}
          registryStatus="active"
          initial={initial}
          forceReadonly={isDemoAgentId(id)}
          lifecycleSlot={<WorkerLifecyclePanel agentId={id} displayName={displayName} />}
        />
      </section>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error } = await supabase.schema("linkaios").from("agents").select("*").eq("id", id).maybeSingle();

  if (error || !agent) {
    return (
      <section className="space-y-4">
        <h2 className={WORKER_DETAIL.tabSectionTitle}>Settings</h2>
        <p className={`max-w-xl ${WORKER_DETAIL.bodyMuted}`}>
          Settings could not be loaded for this id. Confirm the LiNKbot exists in{" "}
          <code className={`rounded bg-zinc-100 px-1 ${TYPE.caption} dark:bg-zinc-800`}>linkaios.agents</code> and that your account
          can read it.
        </p>
        <Link href="/workers" className={`${TYPE.bodyMedium} text-sky-700 underline dark:text-sky-400`}>
          Back to LiNKbots
        </Link>
      </section>
    );
  }

  const initial = parseRuntimeSettings((agent as { runtime_settings?: unknown }).runtime_settings);
  const displayName = String((agent as { display_name: string }).display_name);
  const registryStatus = String((agent as { status?: string }).status ?? "active");

  return (
    <section className="space-y-4">
      <WorkerTabSectionHeader
        title="Settings"
        subtitle="Profile, LiNKbrain files, runtime policy, and lifecycle controls for this LiNKbot."
      />
      <WorkerRoleAwareSettingsForm
        agentId={id}
        displayName={displayName}
        registryStatus={registryStatus}
        initial={initial}
        lifecycleSlot={<WorkerLifecyclePanel agentId={id} displayName={displayName} />}
      />
    </section>
  );
}
