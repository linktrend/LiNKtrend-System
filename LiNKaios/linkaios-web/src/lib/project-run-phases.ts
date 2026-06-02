import "server-only";

import type { GovernanceTraceStep } from "@/lib/client-governance-traces";
import { mapKernelStageToGovernanceTrace } from "@/lib/client-governance-traces";
import type { ProjectTrackedItem } from "@/lib/project-tracked-items";
import {
  LINKSITES_PRINCIPAL_STAGES,
  type LinksitesPrincipalStageId,
} from "../../../../suites/linksites/workflow-map";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SpineRow = {
  run_id: string | null;
  run_status: string | null;
  run_started_at: string | null;
  run_ended_at: string | null;
};

type StageRow = {
  stage_id: string;
  status: string;
  responsible_plane: string;
  started_at: string | null;
  ended_at: string | null;
  lease_ids: string[] | null;
  workflow_run_ids: string[] | null;
  audit_event_ids: string[] | null;
};

/** Map kernel technical stage ids to Principal business phase labels. */
const KERNEL_TO_PRINCIPAL: Record<string, LinksitesPrincipalStageId> = {
  lead_intake: "linksites.lead_generation",
  research_enrichment: "linksites.qualification",
  website_package_generation: "linksites.website_build",
  artifact_write_local: "linksites.website_build",
  supabase_mirror_upsert: "linksites.publish",
  payload_sync_local: "linksites.publish",
  preview_readiness_check: "linksites.publish",
  crm_ready_to_contact_mark: "linksites.publish",
  outreach_draft: "linksites.outreach",
  plane_execution_tracking: "linksites.outreach",
  zulip_run_notify: "linksites.outreach",
  close_or_recycle: "linksites.close_or_recycle",
  record_run: "linksites.close_or_recycle",
};

function stageStatusToTracked(status: string): string {
  if (status === "running") return "running";
  if (status === "pending" || status === "awaiting_approval") return "pending";
  if (status === "failed" || status === "cancelled") return "skipped";
  if (status === "succeeded") return "completed";
  return status;
}

function stageDetail(stage: StageRow): string {
  const parts: string[] = [];
  const leases = stage.lease_ids?.length ?? 0;
  const workflows = stage.workflow_run_ids?.length ?? 0;
  const audits = stage.audit_event_ids?.length ?? 0;
  if (leases) parts.push(`${leases} lease${leases === 1 ? "" : "s"}`);
  if (workflows) parts.push(`${workflows} automation${workflows === 1 ? "" : "s"}`);
  if (audits) parts.push(`${audits} audit event${audits === 1 ? "" : "s"}`);
  return parts.length ? parts.join(" · ") : stage.responsible_plane;
}

function aggregatePrincipalPhases(stages: StageRow[]): ProjectTrackedItem[] {
  const byPrincipal = new Map<LinksitesPrincipalStageId, StageRow[]>();
  for (const stage of stages) {
    const principal = KERNEL_TO_PRINCIPAL[stage.stage_id];
    if (!principal) continue;
    const bucket = byPrincipal.get(principal) ?? [];
    bucket.push(stage);
    byPrincipal.set(principal, bucket);
  }

  return LINKSITES_PRINCIPAL_STAGES.map((principal) => {
    const kernelStages = byPrincipal.get(principal.stageId) ?? [];
    const statuses = kernelStages.map((s) => s.status);
    let status = "pending";
    if (statuses.some((s) => s === "failed")) status = "skipped";
    else if (statuses.some((s) => s === "running" || s === "dispatched")) status = "running";
    else if (statuses.length > 0 && statuses.every((s) => s === "succeeded")) status = "completed";
    else if (statuses.some((s) => s === "succeeded")) status = "running";

    const latest = kernelStages
      .slice()
      .sort((a, b) => {
        const aTime = a.ended_at ?? a.started_at ?? "";
        const bTime = b.ended_at ?? b.started_at ?? "";
        return bTime.localeCompare(aTime);
      })[0];

    const leaseCount = kernelStages.reduce((n, s) => n + (s.lease_ids?.length ?? 0), 0);
    const wfCount = kernelStages.reduce((n, s) => n + (s.workflow_run_ids?.length ?? 0), 0);
    const auditCount = kernelStages.reduce((n, s) => n + (s.audit_event_ids?.length ?? 0), 0);
    const detailParts: string[] = [];
    if (leaseCount) detailParts.push(`${leaseCount} lease${leaseCount === 1 ? "" : "s"}`);
    if (wfCount) detailParts.push(`${wfCount} automation${wfCount === 1 ? "" : "s"}`);
    if (auditCount) detailParts.push(`${auditCount} audit events`);
    if (kernelStages.length) {
      detailParts.push(`${kernelStages.length} kernel stage${kernelStages.length === 1 ? "" : "s"}`);
    }

    return {
      id: principal.stageId,
      title: principal.label,
      status: stageStatusToTracked(status),
      detail: detailParts.length ? detailParts.join(" · ") : principal.summary,
      updatedAt: latest?.ended_at ?? latest?.started_at,
    };
  });
}

export type ProjectPhaseTimeline = {
  runId: string | null;
  items: ProjectTrackedItem[];
  governanceSteps: GovernanceTraceStep[];
  kernelStageItems: ProjectTrackedItem[];
  error: string | null;
};

/**
 * Load LinkSites/kernel phase timeline for a project from persisted run stages.
 * Fail-closed: returns empty items when Supabase or spine RPC is unavailable.
 */
export async function loadProjectPhaseTimeline(projectId: string): Promise<ProjectPhaseTimeline> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { runId: null, items: [], governanceSteps: [], kernelStageItems: [], error: "Supabase not configured" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: spineRows, error: spineErr } = await supabase.schema("linkaios").rpc("get_project_run_spine", {
    p_project_id: projectId,
  });

  if (spineErr) {
    return { runId: null, items: [], governanceSteps: [], kernelStageItems: [], error: spineErr.message };
  }

  const rows = (spineRows ?? []) as SpineRow[];
  const latestRun = rows
    .filter((r) => r.run_id)
    .sort((a, b) => {
      const aTime = a.run_started_at ? new Date(a.run_started_at).getTime() : 0;
      const bTime = b.run_started_at ? new Date(b.run_started_at).getTime() : 0;
      return bTime - aTime;
    })[0];

  if (!latestRun?.run_id) {
    return { runId: null, items: [], governanceSteps: [], kernelStageItems: [], error: null };
  }

  const { data: stageRows, error: stageErr } = await supabase.schema("linkaios_kernel").rpc("get_run_stages", {
    p_run_id: latestRun.run_id,
  });

  if (stageErr) {
    return { runId: latestRun.run_id, items: [], governanceSteps: [], kernelStageItems: [], error: stageErr.message };
  }

  const stages = (stageRows ?? []) as StageRow[];
  const kernelStageItems: ProjectTrackedItem[] = stages.map((stage) => ({
    id: stage.stage_id,
    title: stage.stage_id.replace(/_/g, " "),
    status: stageStatusToTracked(stage.status),
    detail: stageDetail(stage),
    updatedAt: stage.ended_at ?? stage.started_at,
  }));

  const governanceSteps = stages.map((stage) =>
    mapKernelStageToGovernanceTrace({
      stage_id: stage.stage_id,
      status: stage.status,
      responsible_plane: stage.responsible_plane,
      refs: {
        lease_ids: stage.lease_ids ?? undefined,
        workflow_run_ids: stage.workflow_run_ids ?? undefined,
        audit_event_ids: stage.audit_event_ids ?? undefined,
      },
    }),
  );

  return {
    runId: latestRun.run_id,
    items: aggregatePrincipalPhases(stages),
    kernelStageItems,
    governanceSteps,
    error: null,
  };
}
