import { fetchMetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { loadLeaseStatus } from "@/lib/cockpit";
import {
  countTrackedByRank,
  headlineTrackedItem,
  type ProjectTrackedItem,
} from "@/lib/project-tracked-items";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { DEMO_LEASE_ROWS } from "@/lib/ui-mocks/leases-demo";
import { demoMetricsSnapshot } from "@/lib/ui-mocks/metrics-demo-snapshot";
import {
  DEMO_PROJECT_DETAIL_SPECS,
  DEMO_PROJECT_PLANE_BRIDGE,
} from "@/lib/ui-mocks/projects-fixtures";
import {
  demoProjectAutomations,
  demoProjectLinkbots,
} from "@/lib/ui-mocks/project-agents-automations-demo";
import {
  demoProjectIssues,
  demoProjectWorkflows,
} from "@/lib/ui-mocks/project-workflows-issues-demo";

export type ProjectOverviewBrief = {
  description: string;
  expectedOutputs: string[];
};

export type ProjectOverviewSnapshot = {
  workflows: { inProgress: number; next: number; done: number; headline: string | null };
  issues: { inProgress: number; next: number; done: number; headline: string | null };
  linkbots: { total: number; headline: string | null };
  automations: { total: number; headline: string | null };
  runs: { total: number; headline: string | null };
  leases: { total: number; active: number; headline: string | null };
};

function buildSnapshotFromParts(parts: {
  workflows: ProjectTrackedItem[];
  issues: ProjectTrackedItem[];
  linkbotNames: string[];
  automationTitles: string[];
  runs: { event_type: string }[];
  leases: { capability: string; status: string }[];
}): ProjectOverviewSnapshot {
  const workflowCounts = countTrackedByRank(parts.workflows);
  const issueCounts = countTrackedByRank(parts.issues);
  const runningWorkflow = headlineTrackedItem(parts.workflows, 0);
  const activeIssue = headlineTrackedItem(parts.issues, 0);
  const lastRun = parts.runs[0];
  const activeLease = parts.leases.find((l) => l.status === "granted" || l.status === "executed");

  return {
    workflows: {
      ...workflowCounts,
      headline: runningWorkflow?.title ?? headlineTrackedItem(parts.workflows, 1)?.title ?? null,
    },
    issues: {
      ...issueCounts,
      headline: activeIssue?.title ?? headlineTrackedItem(parts.issues, 1)?.title ?? null,
    },
    linkbots: {
      total: parts.linkbotNames.length,
      headline: parts.linkbotNames[0] ?? null,
    },
    automations: {
      total: parts.automationTitles.length,
      headline: parts.automationTitles[0] ?? null,
    },
    runs: {
      total: parts.runs.length,
      headline: lastRun?.event_type ?? null,
    },
    leases: {
      total: parts.leases.length,
      active: parts.leases.filter((l) => l.status === "granted" || l.status === "executed").length,
      headline: activeLease?.capability ?? parts.leases[0]?.capability ?? null,
    },
  };
}

function demoBrief(missionId: string): ProjectOverviewBrief {
  const spec = DEMO_PROJECT_DETAIL_SPECS[missionId];
  if (spec) {
    return { description: spec.description, expectedOutputs: spec.expectedOutputs };
  }
  return {
    description: "Project narrative will appear here once the module phase map is bound.",
    expectedOutputs: ["Deliverables will be listed when the module is configured."],
  };
}

function liveBrief(
  missionId: string,
  title: string,
  bridge?: (typeof DEMO_PROJECT_PLANE_BRIDGE)[string],
): ProjectOverviewBrief {
  const moduleName = bridge?.moduleName ?? "Unmapped module";
  const projectType = bridge?.projectTypeName ?? "Unmapped module";
  const phaseName = bridge?.workflowName ?? "Active phase";
  return {
    description: `${title} runs on ${moduleName} (${projectType}) — current phase: ${phaseName}.`,
    expectedOutputs: [
      "Phase stages completed with audit events in LiNKbrain",
      "Plane issues reflecting remaining human work",
      "Governed capability leases for side effects",
    ],
  };
}

export async function loadProjectOverview(missionId: string, title: string): Promise<{
  brief: ProjectOverviewBrief;
  snapshot: ProjectOverviewSnapshot;
}> {
  if (isUiMocksEnabled()) {
    const workflows = demoProjectWorkflows(missionId);
    const issues = demoProjectIssues(missionId);
    const linkbots = demoProjectLinkbots(missionId);
    const automations = demoProjectAutomations(missionId);
    const runs = demoMetricsSnapshot()
      .runs.filter((r) => r.mission_id === missionId)
      .slice(0, 20);
    const leases = DEMO_LEASE_ROWS.filter((l) => l.mission_id === missionId);

    return {
      brief: demoBrief(missionId),
      snapshot: buildSnapshotFromParts({
        workflows,
        issues,
        linkbotNames: linkbots.map((b) => b.display_name),
        automationTitles: automations.map((a) => a.title),
        runs,
        leases,
      }),
    };
  }

  const supabase = await createSupabaseServerClient();
  const tenantId = "default";
  const bridge = DEMO_PROJECT_PLANE_BRIDGE[missionId];

  const [metricsRes, leasesRaw] = await Promise.all([
    fetchMetricsSnapshot({ days: 30, missionId, agentId: null }),
    loadLeaseStatus(supabase, tenantId, { time_range: "24h" }),
  ]);

  const runIds = new Set(
    (metricsRes.ok ? metricsRes.data.runs : [])
      .map((r) => r.id)
      .filter((id): id is string => Boolean(id)),
  );
  const leases = leasesRaw.filter((l) => l.run_id != null && runIds.has(l.run_id));
  const runs = metricsRes.ok ? metricsRes.data.runs.slice(0, 20) : [];

  return {
    brief: liveBrief(missionId, title, bridge),
    snapshot: buildSnapshotFromParts({
      workflows: [],
      issues: [],
      linkbotNames: [],
      automationTitles: [],
      runs,
      leases,
    }),
  };
}
