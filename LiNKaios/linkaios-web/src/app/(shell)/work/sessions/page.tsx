import { createSupabaseServerClient } from "@/lib/supabase/server";
import { missionIdFromSessionMetadata } from "@/lib/session-display";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";
import { readAppSurfaceFromHeaders } from "@/lib/app-surface";
import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import { isUiMocksEnabledForSurface } from "@/lib/ui-mocks/flags";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { ScopedSessionsInbox } from "../scoped-sessions-inbox";
import { SessionsInbox } from "../sessions-inbox";

export const dynamic = "force-dynamic";

export default async function WorkSessionsPage() {
  const surface = await readAppSurfaceFromHeaders();
  const isAdminSurface = surface === "admin";
  const uiMocksEnabled = isUiMocksEnabledForSurface(surface);
  const licensorTenantId = isAdminSurface ? await resolveLicensorTenantId().catch(() => null) : null;

  const supabase = await createSupabaseServerClient();

  const [sessionsRes, agentsRes] = await Promise.all([
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("id, agent_id, status, started_at, last_heartbeat, ended_at, metadata")
      .order("started_at", { ascending: false })
      .limit(50),
    supabase.schema("linkaios").from("agents").select("id, display_name, runtime_settings, tenant_id"),
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
    const { data: ms } = await supabase.schema("linkaios").from("projects").select("id, title").in("id", missionIds);
    for (const m of ms ?? []) {
      const row = m as { id: string; title: string };
      missionTitles.set(String(row.id), row.title);
    }
  }

  const sessions =
    !err && raw.length
      ? mapWorkerSessionsToThreads(raw as Parameters<typeof mapWorkerSessionsToThreads>[0], agentName, missionTitles)
      : [];

  const agents = (agentsRes.data ?? []).map((a) => ({
    id: String(a.id),
    runtime_settings: a.runtime_settings,
  }));

  return (
    <main>
      <ShellPageHeaderClient
        title="Sessions"
        subtitle="See what each LiNKbot is doing. View opens the session; Cancel ends a running session."
      />
      <div className="mt-8">
        {err ? <p className="mb-4 text-sm text-red-700 dark:text-red-400">Could not load sessions: {err.message}</p> : null}
        {isAdminSurface ? (
          <ScopedSessionsInbox
            sessions={sessions}
            agents={agents}
            licensorTenantId={licensorTenantId}
            uiMocksDemoAgent={uiMocksEnabled}
          />
        ) : (
          <SessionsInbox sessions={sessions} />
        )}
      </div>
    </main>
  );
}
