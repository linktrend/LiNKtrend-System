import Link from "next/link";

import { listBrainDraftsForInbox } from "@linktrend/linklogic-sdk";
import { AlertTriangle, Brain, MessageSquare, Radio } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { alertToneFromMerged, type WorkRowTone } from "@/lib/overview-dashboard";
import { buildAttentionFeed, type AttentionFeedItem } from "@/lib/work-attention-feed";
import { DEMO_CHANNEL_THREADS } from "@/lib/ui-mocks/channel-threads";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_SESSION_THREADS } from "@/lib/ui-mocks/session-threads";
import { DEMO_WORK_ALERTS } from "@/lib/ui-mocks/work-alert-fixtures";
import { traceToWorkAlert } from "@/lib/work-alerts";
import { groupZulipIntoThreads } from "@/lib/work-messages";
import { missionIdFromSessionMetadata } from "@/lib/session-display";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";

export const dynamic = "force-dynamic";

function streamToneClass(_tone: WorkRowTone): string {
  return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";
}

function streamStatusLabel(tone: WorkRowTone): string {
  if (tone === "critical") return "Needs action";
  if (tone === "attention") return "Review";
  return "OK";
}

const chipBase =
  "inline-flex min-w-[6.5rem] shrink-0 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1";

function streamStatusChipClass(tone: WorkRowTone): string {
  if (tone === "critical")
    return `${chipBase} bg-red-100 text-red-800 ring-red-300 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-800`;
  if (tone === "attention")
    return `${chipBase} bg-yellow-100 text-yellow-900 ring-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-200 dark:ring-yellow-700`;
  return `${chipBase} bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800`;
}

function queueRowShellClass(item: AttentionFeedItem): string {
  if (item.kind === "alert" && item.alertSeverity === "critical")
    return "border-l-4 border-l-red-600 dark:border-l-red-500";
  if (item.kind === "alert" && item.alertSeverity === "warning")
    return "border-l-4 border-l-yellow-400 dark:border-l-yellow-400";
  if (item.kind === "session")
    return "border-l-4 border-l-yellow-400 dark:border-l-yellow-400";
  return "border-l-4 border-l-sky-500 dark:border-l-sky-500";
}

function queueRowHoverClass(item: AttentionFeedItem): string {
  if (item.kind === "alert" && item.alertSeverity === "critical")
    return "hover:bg-red-50/80 dark:hover:bg-red-950/40";
  if (item.kind === "alert" && item.alertSeverity === "warning")
    return "hover:bg-yellow-50/90 dark:hover:bg-yellow-950/30";
  if (item.kind === "session")
    return "hover:bg-yellow-50/90 dark:hover:bg-yellow-950/30";
  return "hover:bg-sky-50/70 dark:hover:bg-sky-950/25";
}

function queueItemIconClass(item: AttentionFeedItem): string {
  if (item.kind === "alert") {
    if (item.alertSeverity === "critical") return "mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400";
    if (item.alertSeverity === "warning") return "mt-0.5 h-4 w-4 shrink-0 text-yellow-500 dark:text-yellow-400";
    return "mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400";
  }
  if (item.kind === "message") return "mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400";
  if (item.kind === "session") return "mt-0.5 h-4 w-4 shrink-0 text-yellow-500 dark:text-yellow-400";
  return "mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400";
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

  const zulipThreads = zulipRes.data?.length ? groupZulipIntoThreads(zulipRes.data) : [];
  const messagesMerged = [...(uiMocksEnabled ? DEMO_CHANNEL_THREADS : []), ...zulipThreads].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
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
      <header className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">All Work</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Routing hub — each row sends you to the right workspace; triage happens on the destination screens.
        </p>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Work streams</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/work/alerts"
            className={`flex flex-col rounded-xl border p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md ${streamToneClass(alertTone)}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Alerts
              </span>
              <span className={streamStatusChipClass(alertTone)}>{streamStatusLabel(alertTone)}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{alertsMerged.length}</p>
            <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
              {alertsMerged[0]?.title ?? "—"}
            </p>
          </Link>

          <Link
            href="/work/messages"
            className={`flex flex-col rounded-xl border p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md ${streamToneClass(msgTone)}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <MessageSquare className="h-4 w-4" aria-hidden />
                Messages
              </span>
              <span className={streamStatusChipClass(msgTone)}>{streamStatusLabel(msgTone)}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{messagesMerged.length}</p>
            <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
              {messagesMerged[0] ? `${messagesMerged[0].channel}: ${messagesMerged[0].subject}` : "—"}
            </p>
          </Link>

          <Link
            href="/work/sessions"
            className={`flex flex-col rounded-xl border p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md ${streamToneClass(sessTone)}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <Radio className="h-4 w-4" aria-hidden />
                Sessions
              </span>
              <span className={streamStatusChipClass(sessTone)}>{streamStatusLabel(sessTone)}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{sessionsMerged.length}</p>
            <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
              {sessionsMerged[0] ? `${sessionsMerged[0].agentName} — ${sessionsMerged[0].label}` : "—"}
            </p>
          </Link>

          <Link
            href="/memory?tab=inbox"
            className={`flex flex-col rounded-xl border p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md ${streamToneClass(brainTone)}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <Brain className="h-4 w-4" aria-hidden />
                LiNKbrain Inbox
              </span>
              <span className={streamStatusChipClass(brainTone)}>{streamStatusLabel(brainTone)}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{brainCount}</p>
            <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{brainPreviewLine}</p>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Action queue</h2>
        {queue.length === 0 ? (
          <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
            Nothing in the queue right now.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {queue.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={
                    "flex flex-col gap-1 px-4 py-3 text-sm transition " +
                    queueRowShellClass(item) + " " +
                    queueRowHoverClass(item)
                  }
                >
                  <span className="flex items-start gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {item.kind === "alert" ? (
                      <AlertTriangle className={queueItemIconClass(item)} aria-hidden />
                    ) : item.kind === "message" ? (
                      <MessageSquare className={queueItemIconClass(item)} aria-hidden />
                    ) : item.kind === "session" ? (
                      <Radio className={queueItemIconClass(item)} aria-hidden />
                    ) : (
                      <Brain className={queueItemIconClass(item)} aria-hidden />
                    )}
                    <span className="min-w-0">{item.title}</span>
                  </span>
                  {item.subtitle ? (
                    <span className="line-clamp-2 pl-6 text-xs text-zinc-600 dark:text-zinc-400">{item.subtitle}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

    </main>
  );
}
