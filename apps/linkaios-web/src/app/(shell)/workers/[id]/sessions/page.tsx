import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { AgentRecord } from "@linktrend/shared-types";

import { SessionsInbox } from "../../../work/sessions-inbox";
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Sessions</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Each session is a unit of work tied to a project when session metadata includes that project.
          </p>
          <div className="mt-4">
            <SessionsInbox sessions={threads} />
          </div>
        </section>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <Link href={`/workers/${encodeURIComponent(id)}/projects`} className="font-medium text-sky-700 underline dark:text-sky-400">
            Open Projects tab
          </Link>{" "}
          for projects where this LiNKbot is primary.
        </p>
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Sessions</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sessions are runtime work units. Open a row for timeline, outputs, and interaction notes.
        </p>
        <div className="mt-4">
          <SessionsInbox sessions={threads} />
        </div>
      </section>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        <Link href={`/workers/${encodeURIComponent(id)}/projects`} className="font-medium text-sky-700 underline dark:text-sky-400">
          Open Projects tab
        </Link>{" "}
        for missions where this LiNKbot is primary.
      </p>
    </div>
  );
}
