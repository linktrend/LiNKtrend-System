import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_SESSION_THREADS } from "@/lib/ui-mocks/session-threads";
import { missionIdFromSessionMetadata } from "@/lib/session-display";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";

import { SessionsInbox } from "../sessions-inbox";

export const dynamic = "force-dynamic";

export default async function WorkSessionsPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();

  const [sessionsRes, agentsRes] = await Promise.all([
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("id, agent_id, status, started_at, last_heartbeat, ended_at, metadata")
      .order("started_at", { ascending: false })
      .limit(50),
    supabase.schema("linkaios").from("agents").select("id, display_name"),
  ]);

  const err = sessionsRes.error || agentsRes.error;
  const agentName = new Map<string, string>();
  for (const a of agentsRes.data ?? []) {
    if (a.id) agentName.set(String(a.id), typeof a.display_name === "string" ? a.display_name : "Agent");
  }

  const raw = sessionsRes.data ?? [];
  const missionIds = [...new Set(raw.map((r) => missionIdFromSessionMetadata(r.metadata)).filter(Boolean))] as string[];
  const missionTitles = new Map<string, string>();
  if (missionIds.length > 0) {
    const { data: ms } = await supabase.schema("linkaios").from("missions").select("id, title").in("id", missionIds);
    for (const m of ms ?? []) {
      const row = m as { id: string; title: string };
      missionTitles.set(String(row.id), row.title);
    }
  }

  const fromDb =
    !err && raw.length
      ? mapWorkerSessionsToThreads(raw as Parameters<typeof mapWorkerSessionsToThreads>[0], agentName, missionTitles)
      : [];

  const merged = [...(uiMocksEnabled ? DEMO_SESSION_THREADS : []), ...fromDb].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  return (
    <main>
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Sessions</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          See what each LiNKbot session is doing at a glance. Open a row for the full timeline.
        </p>
      </header>
      <div className="mt-8">
        {err ? <p className="mb-4 text-sm text-red-700 dark:text-red-400">Could not load sessions: {err.message}</p> : null}
        <SessionsInbox sessions={merged} />
      </div>
    </main>
  );
}
