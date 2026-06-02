import fs from "node:fs";
import path from "node:path";

import type { GovernanceTraceStep } from "@/lib/client-governance-traces";
import { mapKernelStageToGovernanceTrace } from "@/lib/client-governance-traces";

export const MVO_LATEST_RUN_RELATIVE = "LiNKdev/product/reports/linktrend-system/mvo-latest-run.json";

export type MvoPhaseTimelineEntry = {
  stage_id: string;
  status: string;
  responsible_plane?: string;
  started_at?: string;
  ended_at?: string;
  lease_ids?: string[];
  workflow_run_ids?: string[];
  audit_event_ids?: string[];
};

export type MvoLatestRunManifest = {
  generated_at: string;
  run_id: string;
  project_id: string | null;
  tenant_id: string;
  work_request_id?: string;
  status: string;
  preview_url: string | null;
  preview_artifact_ref: string | null;
  publish_url?: string | null;
  phase_timeline: MvoPhaseTimelineEntry[];
  lease_ids: string[];
  workflow_run_ids: string[];
  audit_event_ids: string[];
  source: "kernel-e2e" | "demo-harness";
};

/** Resolve manifest path from monorepo root or MVO_LATEST_RUN_PATH override. */
export function resolveMvoRunManifestPath(cwd = process.cwd()): string {
  const fromEnv = process.env.MVO_LATEST_RUN_PATH?.trim();
  if (fromEnv) return fromEnv;

  let dir = cwd;
  for (let depth = 0; depth < 6; depth += 1) {
    if (fs.existsSync(path.join(dir, "LiNKdev"))) {
      return path.join(dir, MVO_LATEST_RUN_RELATIVE);
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return path.join(cwd, MVO_LATEST_RUN_RELATIVE);
}

export function readMvoLatestRunManifest(cwd = process.cwd()): MvoLatestRunManifest | null {
  const filePath = resolveMvoRunManifestPath(cwd);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as MvoLatestRunManifest;
    if (!parsed?.run_id || !parsed?.tenant_id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeMvoLatestRunManifest(manifest: MvoLatestRunManifest, cwd = process.cwd()): string {
  const filePath = resolveMvoRunManifestPath(cwd);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return filePath;
}

export function buildMvoManifestFromKernelTrace(input: {
  run_id: string;
  tenant_id: string;
  project_id?: string | null;
  work_request_id?: string;
  status: string;
  preview_url?: string | null;
  preview_artifact_ref?: string | null;
  publish_url?: string | null;
  stages: Array<{
    stage_id: string;
    status: string;
    responsible_plane?: string;
    started_at?: string;
    ended_at?: string;
    refs?: {
      lease_ids?: string[];
      workflow_run_ids?: string[];
      audit_event_ids?: string[];
    };
  }>;
  lease_ids: string[];
  workflow_run_ids: string[];
  audit_event_ids: string[];
  source?: MvoLatestRunManifest["source"];
}): MvoLatestRunManifest {
  const phase_timeline: MvoPhaseTimelineEntry[] = input.stages.map((stage) => ({
    stage_id: stage.stage_id,
    status: stage.status,
    responsible_plane: stage.responsible_plane,
    started_at: stage.started_at,
    ended_at: stage.ended_at,
    lease_ids: stage.refs?.lease_ids,
    workflow_run_ids: stage.refs?.workflow_run_ids,
    audit_event_ids: stage.refs?.audit_event_ids,
  }));

  return {
    generated_at: new Date().toISOString(),
    run_id: input.run_id,
    project_id: input.project_id ?? null,
    tenant_id: input.tenant_id,
    work_request_id: input.work_request_id,
    status: input.status,
    preview_url: input.preview_url ?? null,
    preview_artifact_ref: input.preview_artifact_ref ?? null,
    publish_url: input.publish_url ?? input.preview_url ?? null,
    phase_timeline,
    lease_ids: input.lease_ids,
    workflow_run_ids: input.workflow_run_ids,
    audit_event_ids: input.audit_event_ids,
    source: input.source ?? "kernel-e2e",
  };
}

export function manifestPhaseTimelineToGovernanceSteps(
  manifest: MvoLatestRunManifest,
): GovernanceTraceStep[] {
  return manifest.phase_timeline.map((stage) =>
    mapKernelStageToGovernanceTrace({
      stage_id: stage.stage_id,
      status: stage.status,
      responsible_plane: stage.responsible_plane ?? "linkaios",
      refs: {
        lease_ids: stage.lease_ids,
        workflow_run_ids: stage.workflow_run_ids,
        audit_event_ids: stage.audit_event_ids,
      },
    }),
  );
}
