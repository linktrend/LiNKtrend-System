import { listBrainDraftsForInbox } from "@linktrend/linklogic-sdk";

import { AttentionQueueRow, ActionQueueList } from "@/components/action-queue";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { SummaryMetricCardGrid, WorkStreamCard } from "@/components/work-stream-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { alertToneFromMerged, type WorkRowTone } from "@/lib/overview-dashboard";
import { WORK_STREAM_STATUS_PILL_LABELS } from "@/lib/status-colors";
import { buildAttentionFeed } from "@/lib/work-attention-feed";
import { DEMO_CHANNEL_THREADS } from "@/lib/ui-mocks/channel-threads";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_SESSION_THREADS } from "@/lib/ui-mocks/session-threads";
import { DEMO_WORK_ALERTS } from "@/lib/ui-mocks/work-alert-fixtures";
import { traceToWorkAlert } from "@/lib/work-alerts";
import { groupZulipIntoThreads, prepareChannelThreads } from "@/lib/work-messages";
import { getZulipSiteUrlFromEnv } from "@/lib/zulip-links";
import { missionIdFromSessionMetadata } from "@/lib/session-display";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";

export const dynamic = "force-dynamic";

function streamToneClass(_tone: WorkRowTone): string {
  return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";
}

export default async function WorkDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();

  const [tracesRes, zulipRes, sessionsRes, agentsRes, brainDraftCountRes, runningSessionsRes, brainDraftsPreview] =
    await Promise.all([
      supabase
        .schema("linkaios")
        .from("traces")
        .select("id, event_type, mission_id, created_at, payload")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .schema("gateway")
        .from("zulip_message_links")
        .select("id, zulip_message_id, stream_id, topic, mission_id, payload, created_at")
        .order("created_at", { ascending: false })
        .limit(80),
      supabase
        .schema("bot_runtime")
        .from("worker_sessions")
        .select("id, agent_id, status, started_at, last_heartbeat, ended_at, metadata")
        .order("started_at", { ascending: false })
        .limit(15),
      supabase.schema("linkaios").from("agents").select("id, display_name"),
      supabase
        .schema("linkaios")
        .from("brain_file_versions")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .schema("bot_runtime")
        .from("worker_sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "running"),
      listBrainDraftsForInbox(supabase, { limit: 1 }),
    ]);

  const traceAlerts =
    tracesRes.data?.map((t) =>
      traceToWorkAlert({
        id: String(t.id),
        event_type: String(t.event_type),
        mission_id: t.mission_id as string | null,
        created_at: String(t.created_at),
        payload: t.payload,
      }),
    ) ?? [];
  const alertsMerged = [...(uiMocksEnabled ? DEMO_WORK_ALERTS : []), ...traceAlerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const zulipSiteUrl = getZulipSiteUrlFromEnv();
  const zulipThreads = zulipRes.data?.length ? groupZulipIntoThreads(zulipRes.data, { zulipSiteUrl }) : [];
  const messagesMerged = prepareChannelThreads(
    [...(uiMocksEnabled ? DEMO_CHANNEL_THREADS : []), ...zulipThreads].sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
    ),
    { zulipSiteUrl },
  );

  const agentName = new Map<string, string>();
  for (const a of agentsRes.data ?? []) {
    if (a.id) agentName.set(String(a.id), typeof a.display_name === "string" ? a.display_name : "LiNKbot");
  }
  const rawSessions = sessionsRes.data ?? [];
  const missionIds = [...new Set(rawSessions.map((r) => missionIdFromSessionMetadata(r.metadata)).filter(Boolean))] as string[];
  const missionTitles = new Map<string, string>();
  if (missionIds.length > 0) {
    const { data: ms } = await supabase.schema("linkaios").from("missions").select("id, title").in("id", missionIds);
    for (const m of ms ?? []) {
      const row = m as { id: string; title: string };
      missionTitles.set(String(row.id), row.title);
    }
  }
  const sessionRows = rawSessions.length
    ? mapWorkerSessionsToThreads(rawSessions as Parameters<typeof mapWorkerSessionsToThreads>[0], agentName, missionTitles)
    : [];
  const sessionsMerged = [...(uiMocksEnabled ? DEMO_SESSION_THREADS : []), ...sessionRows].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  const brainCount = brainDraftCountRes.error ? 0 : brainDraftCountRes.count ?? 0;
  const brainPreviewLine =
    !brainDraftsPreview.error && brainDraftsPreview.data && brainDraftsPreview.data.length > 0
      ? (() => {
          const row = brainDraftsPreview.data[0]!;
          const path = row.logical_path?.trim();
          const kind = row.inbox_item_type.replace(/_/g, " ");
          return path ? `${path} · ${kind}` : `${row.scope} · ${kind}`;
        })()
      : brainCount > 0
        ? `${brainCount} draft(s) in inbox`
        : "Inbox clear";

  const queue = buildAttentionFeed({
    alerts: alertsMerged,
    messages: messagesMerged,
    sessions: sessionsMerged,
    brainDraftCount: brainCount,
  }).slice(0, 16);

  const alertTone = alertToneFromMerged(alertsMerged);
  const msgTone: WorkRowTone = zulipRes.error ? "critical" : messagesMerged.length > 8 ? "attention" : "ok";
  const running = runningSessionsRes.error ? 0 : runningSessionsRes.count ?? 0;
  const sessTone: WorkRowTone = runningSessionsRes.error ? "critical" : running > 0 ? "ok" : "attention";
  const brainTone: WorkRowTone = brainCount > 0 ? "attention" : "ok";
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="All Work"
        subtitle="Pick a category below, or work through the list of items that need you."
      />

      <section>
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Work streams</h2>
        <SummaryMetricCardGrid className="mt-3" statusPillLabels={WORK_STREAM_STATUS_PILL_LABELS}>
          <WorkStreamCard
            kind="alerts"
            tone={alertTone}
            surfaceClass={streamToneClass(alertTone)}
            count={alertsMerged.length}
            preview={alertsMerged[0]?.title ?? "—"}
          />
          <WorkStreamCard
            kind="messages"
            tone={msgTone}
            surfaceClass={streamToneClass(msgTone)}
            count={messagesMerged.length}
            preview={messagesMerged[0] ? `${messagesMerged[0].channel}: ${messagesMerged[0].subject}` : "—"}
          />
          <WorkStreamCard
            kind="sessions"
            tone={sessTone}
            surfaceClass={streamToneClass(sessTone)}
            count={sessionsMerged.length}
            preview={sessionsMerged[0] ? `${sessionsMerged[0].agentName} — ${sessionsMerged[0].label}` : "—"}
          />
          <WorkStreamCard
            kind="brain"
            tone={brainTone}
            surfaceClass={streamToneClass(brainTone)}
            count={brainCount}
            preview={brainPreviewLine}
          />
        </SummaryMetricCardGrid>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Action queue</h2>
        {queue.length === 0 ? (
          <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
            Nothing in the queue right now.
          </p>
        ) : (
          <ActionQueueList className="mt-3">
            {queue.map((item) => (
              <li key={item.id}>
                <AttentionQueueRow item={item} />
              </li>
            ))}
          </ActionQueueList>
        )}
      </section>

    </main>
  );
}
