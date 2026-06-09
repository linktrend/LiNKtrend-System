import Link from "next/link";
import { notFound } from "next/navigation";

import type { AgentRecord } from "@linktrend/shared-types";

import { SessionInteractionPanel } from "@/components/session-interaction-panel";
import { SessionBreadcrumbRegister } from "@/components/session-breadcrumb-register";
import { StatusPill } from "@/components/ui/status-pill";
import { DEMO_SESSION_THREADS } from "@/lib/ui-mocks/session-threads";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";
import type { SessionThreadRow } from "@/lib/work-sessions";
import { SESSION_DISPLAY_PILL_LABELS, type StatusTone } from "@/lib/status-colors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage(props: {
  params: Promise<{ id: string; sessionId: string }>;
  searchParams: Promise<{ panel?: string }>;
}) {
  const { id, sessionId } = await props.params;
  const sp = await props.searchParams;
  const focusTranscript = sp.panel === "transcript";

  if (!isUiMocksEnabled() && isDemoAgentId(id)) {
    notFound();
  }

  if (isUiMocksEnabled() && isDemoAgentId(id)) {
    const row = DEMO_SESSION_THREADS.find((s) => s.id === sessionId && s.agentId === id);
    if (!row) notFound();
    return <SessionDetailShell agentId={id} row={row} focusTranscript={focusTranscript} />;
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error: aErr } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("id, display_name")
    .eq("id", id)
    .maybeSingle();

  if (aErr || !agent) notFound();

  const { data: sess, error: sErr } = await supabase
    .schema("bot_runtime")
    .from("worker_sessions")
    .select("id, agent_id, status, started_at, last_heartbeat, ended_at, metadata")
    .eq("id", sessionId)
    .maybeSingle();

  if (sErr || !sess || String(sess.agent_id) !== String(id)) {
    notFound();
  }

  const missionId =
    typeof sess.metadata === "object" && sess.metadata !== null
      ? (sess.metadata as Record<string, unknown>).mission_id
      : null;
  let projectTitle: string | null = null;
  if (typeof missionId === "string" && missionId.trim()) {
    const { data: m } = await supabase.schema("linkaios").from("projects").select("title").eq("id", missionId).maybeSingle();
    projectTitle = m && typeof (m as { title?: string }).title === "string" ? (m as { title: string }).title : null;
  }

  const names = new Map([[String(agent.id), String((agent as AgentRecord).display_name)]]);
  const missionTitles = new Map<string, string>();
  if (typeof missionId === "string" && missionId.trim() && projectTitle) {
    missionTitles.set(missionId.trim(), projectTitle);
  }
  const [mapped] = mapWorkerSessionsToThreads(
    [sess as Parameters<typeof mapWorkerSessionsToThreads>[0][number]],
    names,
    missionTitles,
  );
  if (!mapped) notFound();

  return <SessionDetailShell agentId={id} row={mapped} focusTranscript={focusTranscript} />;
}

function sessionStatusTone(st: SessionThreadRow["displayStatus"]): StatusTone {
  switch (st) {
    case "running":
      return "active";
    case "waiting":
      return "warning";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}

function statusLabel(st: SessionThreadRow["displayStatus"]): string {
  return st.charAt(0).toUpperCase() + st.slice(1);
}

function SessionDetailShell(props: { agentId: string; row: SessionThreadRow; focusTranscript?: boolean }) {
  const { row, agentId, focusTranscript } = props;
  const agentName = row.agentName;
  const projectLabel = row.projectTitle;
  const display = row.displayStatus;

  const timeline = [
    { t: "Started", at: row.startedAt },
    ...(row.lastHeartbeat ? [{ t: "Last heartbeat", at: row.lastHeartbeat }] : []),
    ...(row.endedAt ? [{ t: "Ended", at: row.endedAt }] : []),
    { t: "Current state", at: `${display} (${row.status})` },
  ];

  return (
    <div className="space-y-8">
      <SessionBreadcrumbRegister sessionId={row.id} title={row.sessionTitle} />
      <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/workers" className="text-sky-700 underline dark:text-sky-400">
            LiNKbots
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/workers/${encodeURIComponent(agentId)}/sessions`} className="text-sky-700 underline dark:text-sky-400">
            {agentName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Session</span>
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{row.sessionTitle}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Agent</dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{agentName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Project</dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {projectLabel && row.projectId ? (
                <Link href={`/projects/${encodeURIComponent(row.projectId)}`} className="text-sky-700 underline dark:text-sky-400">
                  {projectLabel}
                </Link>
              ) : (
                <span className="text-zinc-500">Not linked — add project reference in session metadata when available.</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="mt-1">
              <StatusPill
                label={statusLabel(display)}
                tone={sessionStatusTone(display)}
                equalWidthLabels={SESSION_DISPLAY_PILL_LABELS}
              />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Last activity</dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{new Date(row.lastActivityAt).toLocaleString()}</dd>
          </div>
        </dl>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Timeline</h2>
        <ol className="mt-4 space-y-3 border-l border-zinc-200 pl-4 dark:border-zinc-700">
          {timeline.map((step, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-white dark:ring-zinc-950" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{step.t}</p>
              <p className="text-xs text-zinc-500">
                {/^\d{4}-\d{2}-\d{2}T/.test(step.at) ? new Date(step.at).toLocaleString() : step.at}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="transcript"
        className={
          "rounded-xl border bg-white p-5 shadow-sm dark:bg-zinc-950 " +
          (focusTranscript
            ? "border-sky-300 ring-2 ring-sky-200 dark:border-sky-700 dark:ring-sky-900/50"
            : "border-zinc-200 dark:border-zinc-800")
        }
      >
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Transcript</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Structured outputs from tools and gateway transcripts render here when the runtime records them.
        </p>
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
          {JSON.stringify(row.metadata, null, 2)}
        </pre>
      </section>

      <SessionInteractionPanel />
    </div>
  );
}
