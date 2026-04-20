import Link from "next/link";

import { AgentModelsForm } from "@/components/agent-models-form";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { demoAgentRuntimeSettings } from "@/lib/ui-mocks/worker-ui";
import { parseRuntimeSettings } from "@/lib/agent-runtime-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerModelsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (isDemoAgentId(id)) {
    const initial = demoAgentRuntimeSettings(id);
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Models</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Model selection for the LiNKbot and token usage limits.
          </p>
        </div>
        <AgentModelsForm agentId={id} initial={initial} readonly />
      </section>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !agent) {
    return (
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Models</h2>
        <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Models could not be loaded for this id. Confirm the LiNKbot exists and your account can read{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">linkaios.agents</code>.
        </p>
        <Link href="/workers" className="text-sm font-medium text-sky-700 underline dark:text-sky-400">
          Back to LiNKbots
        </Link>
      </section>
    );
  }

  const initial = parseRuntimeSettings((agent as { runtime_settings?: unknown }).runtime_settings);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Models</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Model selection for the LiNKbot and token usage limits.
        </p>
      </div>
      <AgentModelsForm agentId={id} initial={initial} />
    </section>
  );
}
