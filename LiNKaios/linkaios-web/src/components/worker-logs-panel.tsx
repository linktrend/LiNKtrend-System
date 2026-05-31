import type { AgentRecord } from "@linktrend/shared-types";

import { WorkerSessionLogsTable } from "@/components/worker-session-logs-table";
import { missionIdFromSessionMetadata } from "@/lib/session-display";
import { mapThreadToSessionLog, type SessionLogRow } from "@/lib/session-logs";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoSessionLogsForAgent } from "@/lib/ui-mocks/session-logs-demo";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** LiNKbot closed session logs — OpenClaw JSONL transcript summaries, not live trace events. */
export async function WorkerLogsPanel(props: { agentId: string }) {
  let rows: SessionLogRow[] = [];

  if (isUiMocksEnabled()) {
    rows = demoSessionLogsForAgent(props.agentId);
  } else {
    const supabase = await createSupabaseServerClient();
    const sessionsRes = await supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("id, agent_id, status, started_at, last_heartbeat, ended_at, metadata")
      .eq("agent_id", props.agentId)
      .not("ended_at", "is", null)
      .order("ended_at", { ascending: false })
      .limit(200);

    const rawRows = sessionsRes.data ?? [];
    const missionIds = [...new Set(rawRows.map((r) => missionIdFromSessionMetadata(r.metadata)).filter(Boolean))] as string[];
    const missionTitles = new Map<string, string>();
    if (missionIds.length > 0) {
      const { data: ms } = await supabase.schema("linkaios").from("projects").select("id, title").in("id", missionIds);
      for (const m of ms ?? []) {
        const row = m as { id: string; title: string };
        missionTitles.set(String(row.id), row.title);
      }
    }

    const { data: agent } = await supabase
      .schema("linkaios")
      .from("agents")
      .select("id, display_name")
      .eq("id", props.agentId)
      .maybeSingle();

    const agentNames = new Map<string, string>();
    if (agent) {
      agentNames.set(String((agent as AgentRecord).id), String((agent as AgentRecord).display_name));
    }

    const threads = mapWorkerSessionsToThreads(
      rawRows as Parameters<typeof mapWorkerSessionsToThreads>[0],
      agentNames,
      missionTitles,
    );
    rows = threads.map(mapThreadToSessionLog).filter((r): r is SessionLogRow => r != null);
  }

  return <WorkerSessionLogsTable rows={rows} />;
}
