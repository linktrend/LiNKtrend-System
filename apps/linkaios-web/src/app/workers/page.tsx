import { EntityTable } from "@/components/entity-table";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function WorkersPage() {
  const supabase = getSupabaseAdmin();

  const [sessionsRes, agentsRes] = await Promise.all([
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(100),
    supabase.schema("linkaios").from("agents").select("id, display_name"),
  ]);

  const err = sessionsRes.error || agentsRes.error;
  const agentName = new Map<string, string>();
  for (const a of agentsRes.data ?? []) {
    if (a.id && typeof a.display_name === "string") {
      agentName.set(String(a.id), a.display_name);
    }
  }

  const rows =
    sessionsRes.data?.map((s) => ({
      ...s,
      agent_display: agentName.get(String(s.agent_id)) ?? s.agent_id,
    })) ?? [];

  if (err) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900">Workers</h1>
        <p className="mt-4 text-sm text-red-700">{err.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">Workers</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Sessions from <code className="text-xs">bot_runtime.worker_sessions</code> (LiNKbot / runtime wrapper).
      </p>
      <div className="mt-8">
        <EntityTable
          title="Worker sessions"
          rows={rows}
          columns={["agent_display", "status", "last_heartbeat", "started_at"]}
        />
      </div>
    </main>
  );
}
