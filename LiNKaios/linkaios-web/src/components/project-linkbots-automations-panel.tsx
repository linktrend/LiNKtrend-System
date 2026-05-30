import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

import { fetchMetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { LinkskillsLeasesPanel } from "@/components/linkskills-leases-panel";
import { agentOperationalUxFromSessions } from "@/lib/agent-operational-ux";
import { parseRuntimeSettings } from "@/lib/agent-runtime-settings";
import { loadWorkflowRunStatus } from "@/lib/cockpit";
import {
  formatFleetHeartbeat,
  linkbotFleetStatusLabel,
  linkbotFleetStatusTone,
} from "@/lib/linkbot-fleet-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BADGE } from "@/lib/ui-standards";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import {
  demoProjectAutomations,
  demoProjectLinkbots,
  type ProjectAutomationRow,
  type ProjectLinkbotRow,
} from "@/lib/ui-mocks/project-agents-automations-demo";

function titleFromRuntime(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const lp = (raw as Record<string, unknown>).linkaios_profile;
  if (!lp || typeof lp !== "object") return null;
  const t = (lp as Record<string, unknown>).title;
  return typeof t === "string" && t.trim() ? t.trim() : null;
}

function formatLastRun(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return formatFleetHeartbeat(iso) ?? new Date(iso).toLocaleString();
}

function humanizeWorkflowHandle(handle: string): string {
  const base = handle.split("/").pop() ?? handle;
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProjectLinkbotList(props: { rows: ProjectLinkbotRow[] }) {
  if (props.rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No LiNKbots are assigned to this project yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {props.rows.map((agent) => (
        <li key={agent.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{agent.display_name}</p>
            <p className="mt-0.5 text-xs font-medium text-violet-800 dark:text-violet-300">Role · {agent.role}</p>
            {agent.lastHeartbeatIso ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Last heartbeat · {formatFleetHeartbeat(agent.lastHeartbeatIso)}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`font-semibold ${BADGE.status} ${linkbotFleetStatusTone(agent.statusLabel)}`}>
              {agent.statusLabel}
            </span>
            <Link
              href={`/workers/${encodeURIComponent(agent.id)}/sessions`}
              aria-label={`Open ${agent.display_name} in LiNKbots`}
              title={`Open ${agent.display_name} in LiNKbots`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <SquareArrowOutUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProjectAutomationsList(props: { rows: ProjectAutomationRow[] }) {
  if (props.rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No automations are registered for this project yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {props.rows.map((row) => {
        const lastRun = formatLastRun(row.lastRunIso);
        return (
          <li key={row.id} className="px-4 py-4 text-sm">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</p>
            {lastRun ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Last run · {lastRun}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

async function loadProjectLinkbotsAndAutomations(missionId: string, primaryAgentId: string | null) {
  if (isUiMocksEnabled()) {
    return {
      linkbots: demoProjectLinkbots(missionId),
      automations: demoProjectAutomations(missionId),
    };
  }

  const supabase = await createSupabaseServerClient();
  const tenantId = "default";

  const [sessionsRes, agentsRes, metricsRes, workflowRuns] = await Promise.all([
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("agent_id, status, started_at, last_heartbeat")
      .order("started_at", { ascending: false })
      .limit(200),
    supabase.schema("linkaios").from("agents").select("id, display_name, status, runtime_settings"),
    fetchMetricsSnapshot({ days: 30, missionId, agentId: null }),
    loadWorkflowRunStatus(supabase, tenantId),
  ]);

  const agentIds = new Set<string>();
  if (primaryAgentId) agentIds.add(primaryAgentId);
  if (metricsRes.ok) {
    for (const run of metricsRes.data.runs) {
      if (run.agent_id) agentIds.add(String(run.agent_id));
    }
  }

  const sessionLites = (sessionsRes.data ?? []) as {
    agent_id: string;
    status: string;
    started_at: string;
    last_heartbeat: string | null;
  }[];

  const linkbots: ProjectLinkbotRow[] = (agentsRes.data ?? [])
    .filter((a) => agentIds.has(String(a.id)))
    .map((a) => {
      const operationalUx = agentOperationalUxFromSessions(String(a.id), sessionLites);
      const statusLabel = linkbotFleetStatusLabel(a.status, operationalUx);
      const parsed = parseRuntimeSettings(a.runtime_settings ?? {});
      const role = parsed.linkaiosProfile.title?.trim() || titleFromRuntime(a.runtime_settings) || "LiNKbot";
      const latest = sessionLites
        .filter((s) => String(s.agent_id) === String(a.id))
        .sort((x, y) => new Date(y.started_at).getTime() - new Date(x.started_at).getTime())[0];
      return {
        id: String(a.id),
        display_name: String(a.display_name),
        role,
        statusLabel,
        lastHeartbeatIso: latest?.last_heartbeat ?? null,
      };
    });

  const runIds = new Set(
    (metricsRes.ok ? metricsRes.data.runs : []).map((r) => r.id).filter((id): id is string => Boolean(id)),
  );

  const automations: ProjectAutomationRow[] = workflowRuns
    .filter((w) => w.run_id != null && runIds.has(w.run_id))
    .map((w) => ({
      id: w.workflow_run_id,
      title: humanizeWorkflowHandle(w.workflow_handle),
      lastRunIso: w.completed_at ?? w.invoked_at,
    }));

  return { linkbots, automations };
}

/** Project-scoped LiNKbots and LiNKautowork automations for the project detail tab. */
export async function ProjectLinkbotsAutomationsPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
  primaryAgentId?: string | null;
}) {
  const projectId = resolveProjectIdFromProps(props);
  const { linkbots, automations } = await loadProjectLinkbotsAndAutomations(
    projectId,
    props.primaryAgentId ?? null,
  );

  return (
    <div className="space-y-8">
      <section aria-labelledby="project-linkbots-heading" className="space-y-3">
        <h2 id="project-linkbots-heading" className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
          LiNKbots
        </h2>
        <ProjectLinkbotList rows={linkbots} />
      </section>

      <section aria-labelledby="project-automations-heading" className="space-y-3">
        <h2 id="project-automations-heading" className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
          Automations
        </h2>
        <ProjectAutomationsList rows={automations} />
      </section>
    </div>
  );
}

/** Project-scoped LinkSkills leases — same surface as `/skills/leases`. */
export async function ProjectLeasesPanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
}) {
  return <LinkskillsLeasesPanel projectId={resolveProjectIdFromProps(props)} />;
}
