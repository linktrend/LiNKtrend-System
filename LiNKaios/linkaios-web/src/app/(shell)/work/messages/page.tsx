import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_CHANNEL_THREADS } from "@/lib/ui-mocks/channel-threads";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { groupZulipIntoThreads, prepareChannelThreads } from "@/lib/work-messages";
import { getZulipSiteUrlFromEnv } from "@/lib/zulip-links";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
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
    supabase.schema("linkaios").from("projects").select("id, primary_agent_id"),
  ]);

  const { data: rows, error } = zulipRes;
  const zulipSiteUrl = getZulipSiteUrlFromEnv();
  const fromDb = !error && rows?.length ? groupZulipIntoThreads(rows, { zulipSiteUrl }) : [];
  const merged = prepareChannelThreads(
    [...(uiMocksEnabled ? DEMO_CHANNEL_THREADS : []), ...fromDb].sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
    ),
    { zulipSiteUrl },
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
      <ShellPageHeaderClient
        title="Messages"
        subtitle="Threads from connected channels, newest first. Open a channel product to reply in Zulip, Slack, or Telegram."
      />
      <div className="mt-8">
        {error ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100" role="status">
            Channel data could not be loaded. Showing fixtures only if enabled; otherwise the workspace may be empty.
          </p>
        ) : null}
        <WorkMessagesWorkspace threads={merged} agents={agents} missionPrimaryAgent={missionPrimaryAgent} />
      </div>
    </main>
  );
}
