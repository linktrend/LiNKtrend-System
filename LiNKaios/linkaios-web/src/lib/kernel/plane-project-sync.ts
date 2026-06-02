import "server-only";

import type { Env } from "@linktrend/shared-config";
import { loadEnv } from "@linktrend/shared-config";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

import { PlaneReadinessError, resolvePlaneMode } from "./plane-adapter";
import { bootstrapPlaneProjectFromSuite, getPlaneProject, type PlaneBootstrapResult } from "./plane-bootstrap";
import { integrationFailureFromPlane } from "./plane-api-client";

export type PlaneProjectSyncInput = {
  tenant_id: string;
  linkaios_project_id: string;
  project_title: string;
  suite_id: string;
  module_ids: string[];
  cadence: "once" | "continuous";
};

export type PlaneProjectSyncResult = {
  status: "live" | "stub" | "shadow";
  synced: boolean;
  created: boolean;
  plane_project_id: string | null;
  plane_project_identifier: string | null;
  plane_url: string | null;
  task_id: string | null;
  message: string;
};

function leadIdForProject(projectId: string): string {
  return projectId;
}

function planePublicBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_PLANE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : null;
}

function planeWorkspaceSlugPublic(): string | null {
  const slug = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG?.trim();
  return slug ? slug.replace(/^\/+|\/+$/g, "") : null;
}

export function buildPlaneProjectUrl(planeProjectId: string, identifier?: string | null): string | null {
  const base = planePublicBaseUrl();
  const slug = planeWorkspaceSlugPublic() ?? process.env.PLANE_WORKSPACE_SLUG?.trim();
  if (!base || !slug) return null;
  const segment = identifier?.trim() || planeProjectId;
  return `${base}/${slug}/projects/${encodeURIComponent(segment)}/`;
}

export function isPlaneLiveConfigured(env: Env = loadEnv()): boolean {
  return resolvePlaneMode(env) === "live";
}

async function loadExistingMapping(
  tenantId: string,
  projectId: string,
): Promise<{ plane_project_id: string } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("linkskills")
    .from("plane_project_mappings")
    .select("plane_project_id")
    .eq("tenant_id", tenantId)
    .eq("lead_id", leadIdForProject(projectId))
    .maybeSingle();

  if (error || !data?.plane_project_id) {
    return null;
  }
  return { plane_project_id: data.plane_project_id as string };
}

async function persistMapping(tenantId: string, projectId: string, planeProjectId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.schema("linkskills").rpc("upsert_plane_project_mapping", {
    p_tenant_id: tenantId,
    p_lead_id: leadIdForProject(projectId),
    p_plane_project_id: planeProjectId,
  });

  if (error) {
    throw new Error(`Plane mapping persist failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return Boolean(row?.created);
}

async function recordProjectTrace(projectId: string, payload: Record<string, unknown>): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.schema("linkaios").from("traces").insert({
    project_id: projectId,
    event_type: "plane.project.synced",
    payload,
  });
}

/**
 * Idempotent Plane bootstrap/sync for a LiNKaios project (live mode only).
 */
export async function syncLinkaiosProjectToPlane(
  input: PlaneProjectSyncInput,
  env: Env = loadEnv(),
): Promise<PlaneProjectSyncResult> {
  const mode = resolvePlaneMode(env);

  if (mode === "stub") {
    return {
      status: "stub",
      synced: false,
      created: false,
      plane_project_id: null,
      plane_project_identifier: null,
      plane_url: null,
      task_id: null,
      message: "Plane integration is in stub mode; no remote writes were sent.",
    };
  }

  if (mode === "shadow_readiness") {
    return {
      status: "shadow",
      synced: false,
      created: false,
      plane_project_id: null,
      plane_project_identifier: null,
      plane_url: null,
      task_id: null,
      message: "Plane is in shadow_readiness mode; use live mode for project bootstrap.",
    };
  }

  try {
    const existing = await loadExistingMapping(input.tenant_id, input.linkaios_project_id);
    if (existing) {
      const remote = await getPlaneProject(env, existing.plane_project_id);
      const identifier = remote?.identifier ?? null;
      const url = buildPlaneProjectUrl(existing.plane_project_id, identifier);
      return {
        status: "live",
        synced: Boolean(remote),
        created: false,
        plane_project_id: existing.plane_project_id,
        plane_project_identifier: identifier,
        plane_url: url,
        task_id: null,
        message: remote
          ? "Plane project already linked; verified via API."
          : "Mapping exists but Plane project was not found (fail-closed).",
      };
    }

    const bootstrap: PlaneBootstrapResult = await bootstrapPlaneProjectFromSuite(env, {
      tenant_id: input.tenant_id,
      linkaios_project_id: input.linkaios_project_id,
      project_title: input.project_title,
      suite_id: input.suite_id,
      module_ids: input.module_ids,
      cadence: input.cadence,
    });

    const created = await persistMapping(
      input.tenant_id,
      input.linkaios_project_id,
      bootstrap.plane_project_id,
    );

    const url = buildPlaneProjectUrl(bootstrap.plane_project_id, bootstrap.plane_project_identifier);

    await recordProjectTrace(input.linkaios_project_id, {
      plane_project_id: bootstrap.plane_project_id,
      plane_project_identifier: bootstrap.plane_project_identifier,
      plane_cycle_id: bootstrap.plane_cycle_id,
      plane_module_count: bootstrap.plane_module_ids.length,
      plane_issue_count: bootstrap.plane_issue_ids.length,
      plane_url: url,
      created,
    });

    return {
      status: "live",
      synced: true,
      created,
      plane_project_id: bootstrap.plane_project_id,
      plane_project_identifier: bootstrap.plane_project_identifier,
      plane_url: url,
      task_id: bootstrap.task_id,
      message: created
        ? "Plane project bootstrapped from suite template."
        : "Plane project mapping updated from suite template.",
    };
  } catch (error) {
    if (error instanceof PlaneReadinessError) {
      const mapped = integrationFailureFromPlane(error);
      return {
        status: "live",
        synced: false,
        created: false,
        plane_project_id: null,
        plane_project_identifier: null,
        plane_url: null,
        task_id: null,
        message: mapped.message,
      };
    }
    throw error;
  }
}
