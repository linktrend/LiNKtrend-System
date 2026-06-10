import "server-only";

import { loadEnv } from "@linktrend/shared-config";
import { bootstrapProjectZulip, zulipLiveReady } from "@linktrend/zulip-gateway";
import { recordTrace } from "@linktrend/linklogic-sdk";

import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import {
  adminProjectTypeLabel,
  isAdminProjectType,
  resolveAdminProjectCreatePreset,
  type AdminProjectType,
} from "@/lib/admin-project-types";
import { isPlaneLiveConfigured, syncLinkaiosProjectToPlane } from "@/lib/kernel/plane-project-sync";
import type { CreateProjectResponse, ProjectCadence } from "@/lib/projects/types";
import { CreateProjectError } from "@/lib/projects/types";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_NAME_LENGTH = 200;

export type CreateAdminProjectRequest = {
  name: string;
  projectType: AdminProjectType;
  cadence: ProjectCadence;
};

type CreateProjectRow = {
  project_id: string;
  created_at: string;
};

function persistenceEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SECRET_KEY &&
      process.env.LINKAIOS_PROJECTS_PERSIST !== "0",
  );
}

export function parseCreateAdminProjectRequest(body: unknown): CreateAdminProjectRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new CreateProjectError("Invalid JSON body", 400);
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) {
    throw new CreateProjectError("Validation failed", 400, [{ field: "name", message: "name is required" }]);
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new CreateProjectError("Validation failed", 400, [
      { field: "name", message: `name must be at most ${MAX_NAME_LENGTH} characters` },
    ]);
  }

  const projectType = record.projectType;
  if (!isAdminProjectType(projectType)) {
    throw new CreateProjectError("Validation failed", 400, [
      { field: "projectType", message: "projectType must be suite_gen, librarian_filings, or platform_ops" },
    ]);
  }

  const cadence = record.cadence;
  if (cadence !== "once" && cadence !== "continuous") {
    throw new CreateProjectError("Validation failed", 400, [
      { field: "cadence", message: 'cadence must be "once" or "continuous"' },
    ]);
  }

  return { name, projectType, cadence };
}

/**
 * Persist a vendor-scoped Admin project via linkaios.create_project (licensor tenant only).
 */
export async function createAdminProjectPersisted(
  input: CreateAdminProjectRequest,
): Promise<CreateProjectResponse> {
  if (!persistenceEnabled()) {
    throw new CreateProjectError("Project persistence is not configured", 503);
  }

  const tenantId = await resolveLicensorTenantId();
  if (!tenantId) {
    throw new CreateProjectError("Licensor tenant is not available", 503);
  }

  const preset = resolveAdminProjectCreatePreset(input.projectType);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.schema("linkaios").rpc("create_project", {
    p_tenant_id: tenantId,
    p_title: input.name,
    p_suite_id: preset.suiteId,
    p_module_ids: preset.moduleIds,
    p_cadence: input.cadence,
    p_actor_id: null,
  });

  if (error || !data?.length) {
    throw new CreateProjectError(
      `create_project RPC failed: ${error?.message ?? "empty result"}`,
      500,
    );
  }

  const row = data[0] as CreateProjectRow;
  let planeBootstrap: CreateProjectResponse["planeBootstrap"] = "pending";

  if (isPlaneLiveConfigured(loadEnv())) {
    const plane = await syncLinkaiosProjectToPlane({
      tenant_id: tenantId,
      linkaios_project_id: row.project_id,
      project_title: input.name,
      suite_id: preset.suiteId,
      module_ids: preset.moduleIds,
      cadence: input.cadence,
    });
    planeBootstrap = plane.synced ? "live" : "pending";
  }

  const env = loadEnv();
  if (zulipLiveReady(env)) {
    try {
      const zulip = await bootstrapProjectZulip(env, supabase, {
        projectId: row.project_id,
        projectTitle: input.name,
        tenantId,
        suiteId: preset.suiteId,
      });
      if (zulip.bootstrapped) {
        await recordTrace(env, {
          eventType: "project.zulip_bootstrapped",
          missionId: row.project_id,
          payload: {
            stream_name: zulip.stream_name,
            stream_id: zulip.stream_id,
            topics: zulip.topics,
            welcome_message_id: zulip.welcome_message_id,
            project_type: input.projectType,
            project_type_label: adminProjectTypeLabel(input.projectType),
          },
        });
      }
    } catch (err) {
      console.error("Admin project Zulip bootstrap failed (non-fatal):", err);
    }
  }

  return {
    projectId: row.project_id,
    missionId: row.project_id,
    planeBootstrap,
    createdAt: row.created_at,
  };
}

/** Idempotent MVO seed — one vendor project when licensor tenant has none. */
export async function ensureMinimalVendorProjectSeed(): Promise<{ seeded: boolean; projectId?: string }> {
  if (!persistenceEnabled()) {
    return { seeded: false };
  }

  const tenantId = await resolveLicensorTenantId();
  if (!tenantId) {
    return { seeded: false };
  }

  const supabase = getSupabaseAdmin();
  const { count, error: countError } = await supabase
    .schema("linkaios")
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  if (countError || (count ?? 0) > 0) {
    return { seeded: false };
  }

  const result = await createAdminProjectPersisted({
    name: "LiNKsuitegen catalogue",
    projectType: "suite_gen",
    cadence: "continuous",
  });

  return { seeded: true, projectId: result.projectId };
}
