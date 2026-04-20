import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_CHANNEL_THREADS } from "@/lib/ui-mocks/channel-threads";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { groupZulipIntoThreads } from "@/lib/work-messages";

import { WorkMessagesWorkspace } from "../work-messages-workspace";

export const dynamic = "force-dynamic";

export default async function WorkMessagesPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();

  const [zulipRes, agentsRes, missionsRes] = await Promise.all([
    supabase
      .schema("gateway")
      .from("zulip_message_links")
      .select("id, zulip_message_id, stream_id, topic, mission_id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.schema("linkaios").from("agents").select("id, display_name").order("display_name", { ascending: true }),
    supabase.schema("linkaios").from("missions").select("id, primary_agent_id"),
  ]);

  const { data: rows, error } = zulipRes;
  const fromDb = !error && rows?.length ? groupZulipIntoThreads(rows) : [];
  const merged = [...(uiMocksEnabled ? DEMO_CHANNEL_THREADS : []), ...fromDb].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );

  const agents =
    (agentsRes.data ?? []).map((a) => ({
      id: String((a as { id: string }).id),
      display_name: String((a as { display_name: string }).display_name ?? "LiNKbot"),
    })) ?? [];

  const missionPrimaryAgent: Record<string, string | null> = {};
  if (!missionsRes.error) {
    for (const m of missionsRes.data ?? []) {
      const row = m as { id: string; primary_agent_id: string | null };
      missionPrimaryAgent[String(row.id)] = row.primary_agent_id ? String(row.primary_agent_id) : null;
    }
  }

  return (
    <main>
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Messages</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Choose a channel (Zulip first), then filter by LiNKbot. Slack and Telegram appear when the gateway stores those threads.
        </p>
      </header>
      <div className="mt-8">
        {error ? (
          <p className="mb-4 text-sm text-amber-800 dark:text-amber-200">
            Channel data could not be loaded. Showing fixtures only if enabled; otherwise the workspace may be empty.
          </p>
        ) : null}
        <WorkMessagesWorkspace threads={merged} agents={agents} missionPrimaryAgent={missionPrimaryAgent} />
      </div>
    </main>
  );
}
