import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

import type { AgentRecord } from "@linktrend/shared-types";

import { SessionsInbox } from "../../../work/sessions-inbox";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { DEMO_SESSION_THREADS } from "@/lib/ui-mocks/session-threads";
import { missionIdFromSessionMetadata } from "@/lib/session-display";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerSessionsPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const legacySession = sp.session?.trim();
  if (legacySession) {
    redirect(`/workers/${encodeURIComponent(id)}/sessions/${encodeURIComponent(legacySession)}`);
  }

  if (isDemoAgentId(id)) {
    const threads = DEMO_SESSION_THREADS.filter((t) => t.agentId === id);
    return (
      <div className="space-y-6">
        <section>
          <WorkerTabSectionHeader
            title="Sessions"
            subtitle="Each session is a unit of work. Respond opens the session chat; Stop closes the session."
          />
          <div className="mt-4">
            <SessionsInbox sessions={threads} />
          </div>
        </section>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error: agentErr } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("id, display_name")
    .eq("id", id)
    .maybeSingle();

  if (agentErr || !agent) {
    notFound();
  }

  const sessionsRes = await supabase
    .schema("bot_runtime")
    .from("worker_sessions")
    .select("id, agent_id, status, started_at, last_heartbeat, ended_at, metadata")
    .eq("agent_id", id)
    .order("started_at", { ascending: false })
    .limit(80);

  const agentNames = new Map<string, string>([[String(agent.id), String((agent as AgentRecord).display_name)]]);
  const rawRows = sessionsRes.data ?? [];
  const missionIds = [...new Set(rawRows.map((r) => missionIdFromSessionMetadata(r.metadata)).filter(Boolean))] as string[];
  const missionTitles = new Map<string, string>();
  if (missionIds.length > 0) {
    const { data: ms } = await supabase.schema("linkaios").from("missions").select("id, title").in("id", missionIds);
    for (const m of ms ?? []) {
      const row = m as { id: string; title: string };
      missionTitles.set(String(row.id), row.title);
    }
  }

  const threads = mapWorkerSessionsToThreads(rawRows as Parameters<typeof mapWorkerSessionsToThreads>[0], agentNames, missionTitles);

  return (
    <div className="space-y-6">
      <section>
        <WorkerTabSectionHeader
          title="Sessions"
          subtitle="Sessions are runtime work units. Open a row for timeline, outputs, and interaction notes."
        />
        <div className="mt-4">
          <SessionsInbox sessions={threads} />
        </div>
      </section>
    </div>
  );
}
