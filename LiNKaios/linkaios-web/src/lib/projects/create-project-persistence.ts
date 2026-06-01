import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

import type { CreateProjectRequest, CreateProjectResponse } from "./types";

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

async function resolveTenantId(): Promise<string> {
  const fromEnv = process.env.MVO_E2E_TENANT_ID?.trim();
  if (fromEnv) return fromEnv;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.schema("linkaios_kernel").rpc("seed_demo_tenant", {
    p_slug: "demo",
    p_display_name: "Demo Tenant",
  });
  if (error || !data?.length) {
    throw new Error(`Failed to resolve tenant: ${error?.message ?? "empty seed_demo_tenant result"}`);
  }
  const row = data[0] as { tenant_id?: string };
  if (!row.tenant_id) {
    throw new Error("seed_demo_tenant returned no tenant_id");
  }
  return row.tenant_id;
}

/**
 * Persist a project via linkaios.create_project RPC (Supabase service role).
 */
export async function createProjectPersisted(
  input: CreateProjectRequest,
  opts: { actorId?: string | null } = {},
): Promise<CreateProjectResponse> {
  const supabase = getSupabaseAdmin();
  const tenantId = await resolveTenantId();

  const { data, error } = await supabase.schema("linkaios").rpc("create_project", {
    p_tenant_id: tenantId,
    p_title: input.name,
    p_suite_id: input.suiteId,
    p_module_ids: input.moduleIds,
    p_cadence: input.cadence,
    p_actor_id: opts.actorId ?? null,
  });

  if (error || !data?.length) {
    throw new Error(`create_project RPC failed: ${error?.message ?? "empty result"}`);
  }

  const row = data[0] as CreateProjectRow;
  return {
    projectId: row.project_id,
    missionId: row.project_id,
    planeBootstrap: "pending",
    createdAt: row.created_at,
  };
}

export { persistenceEnabled };
