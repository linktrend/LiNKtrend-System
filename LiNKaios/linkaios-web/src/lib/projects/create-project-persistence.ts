import "server-only";

import { loadEnv } from "@linktrend/shared-config";
import { bootstrapProjectZulip, zulipLiveReady } from "@linktrend/zulip-gateway";
import { recordTrace } from "@linktrend/linklogic-sdk";

import { isPlaneLiveConfigured, syncLinkaiosProjectToPlane } from "@/lib/kernel/plane-project-sync";
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

  const tenantSlug = process.env.MVO_TENANT_SLUG?.trim() || "demo";
  const displayName =
    tenantSlug === "calusa" ? "Calusa" : tenantSlug === "demo" ? "Demo Tenant" : tenantSlug;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.schema("linkaios_kernel").rpc("seed_demo_tenant", {
    p_slug: tenantSlug,
    p_display_name: displayName,
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
  let planeBootstrap: CreateProjectResponse["planeBootstrap"] = "pending";

  if (isPlaneLiveConfigured(loadEnv())) {
    const plane = await syncLinkaiosProjectToPlane({
      tenant_id: tenantId,
      linkaios_project_id: row.project_id,
      project_title: input.name,
      suite_id: input.suiteId,
      module_ids: input.moduleIds,
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
        suiteId: input.suiteId,
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
          },
        });
      }
    } catch (err) {
      console.error("Zulip project bootstrap failed (non-fatal):", err);
    }
  }

  return {
    projectId: row.project_id,
    missionId: row.project_id,
    planeBootstrap,
    createdAt: row.created_at,
  };
}

export { persistenceEnabled };
