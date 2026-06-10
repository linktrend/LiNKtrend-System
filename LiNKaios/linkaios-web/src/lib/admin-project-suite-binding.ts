import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  adminProcessById,
  adminProcessesForSuite,
  ADMIN_VENDOR_SUITES,
} from "@/lib/admin-suite-templates";
import type { AdminProjectType } from "@/lib/admin-project-types";
import { resolveAdminProjectCreatePreset } from "@/lib/admin-project-types";
import { isAdminBot, type IsAdminBotInput } from "@/lib/agent-fleet-classification";
import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";

/** Display name for a vendor suite id on Admin project surfaces. */
export function adminSuiteDisplayName(suiteId: string | null | undefined): string {
  if (!suiteId) return "—";
  const match = ADMIN_VENDOR_SUITES.find((s) => s.id === suiteId);
  return match?.name ?? suiteId;
}

/** Human-readable module labels from template ids. */
export function adminModuleDisplayNames(suiteId: string | null, moduleIds: string[]): string {
  if (moduleIds.length === 0) {
    const fallback = suiteId ? adminProcessesForSuite(suiteId) : [];
    if (fallback.length === 0) return "—";
    return fallback.map((m) => m.name).join(" → ");
  }
  return moduleIds
    .map((id) => adminProcessById(id)?.name ?? id)
    .join(" → ");
}

type LeadExecutorTemplate = {
  name: string;
  roleId?: string;
};

/** First agent executor from the module template — used to resolve lead LiNKbot. */
export function adminLeadExecutorTemplate(projectType: AdminProjectType): LeadExecutorTemplate {
  const preset = resolveAdminProjectCreatePreset(projectType);
  const module = adminProcessById(preset.moduleIds[0]);
  const firstAgent = module?.workflows
    ?.flatMap((w) => w.issues)
    .flatMap((i) => i.executors)
    .find((e) => e.kind === "agent");
  return {
    name: firstAgent?.name ?? "LiNKbot",
    roleId: firstAgent?.roleId,
  };
}

/** @deprecated Prefer {@link adminLeadExecutorTemplate}. */
export function adminLeadAgentDisplayName(projectType: AdminProjectType): string {
  return adminLeadExecutorTemplate(projectType).name;
}

type AgentFleetRow = IsAdminBotInput & {
  display_name: string;
  tenant_id?: string | null;
};

function roleIdFromRuntimeSettings(runtimeSettings: unknown): string | null {
  if (!runtimeSettings || typeof runtimeSettings !== "object") return null;
  const raw = runtimeSettings as Record<string, unknown>;
  const fleet = raw.linkaios_fleet;
  if (fleet && typeof fleet === "object") {
    const role = (fleet as Record<string, unknown>).role_id;
    if (typeof role === "string" && role.trim()) return role.trim();
  }
  const profile = raw.linkaios_profile;
  if (profile && typeof profile === "object") {
    const role = (profile as Record<string, unknown>).role_id;
    if (typeof role === "string" && role.trim()) return role.trim();
  }
  return null;
}

/**
 * Resolve licensor fleet agent UUID for a suite lead executor — exact name or role_id match.
 */
export function resolveLicensorLeadAgentId(
  agents: AgentFleetRow[],
  lead: LeadExecutorTemplate,
  licensorTenantId: string | null,
): string | null {
  const licensorFleet = agents.filter((agent) =>
    isAdminBot(agent, { licensorTenantId, uiMocksDemoAgent: false }),
  );

  if (lead.roleId) {
    const byRole = licensorFleet.find(
      (agent) => roleIdFromRuntimeSettings(agent.runtime_settings) === lead.roleId,
    );
    if (byRole?.id) return String(byRole.id);
  }

  const exactName = licensorFleet.find(
    (agent) => agent.display_name?.trim().toLowerCase() === lead.name.trim().toLowerCase(),
  );
  if (exactName?.id) return String(exactName.id);

  return null;
}

/**
 * After create_project, bind suite template metadata: primary_agent_id from licensor fleet UUID.
 */
export async function bindAdminProjectSuiteTemplate(
  supabase: SupabaseClient,
  projectId: string,
  projectType: AdminProjectType,
): Promise<{ primaryAgentId: string | null }> {
  const lead = adminLeadExecutorTemplate(projectType);
  const licensorTenantId = await resolveLicensorTenantId();

  const { data: agents } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("id, display_name, runtime_settings, tenant_id")
    .limit(200);

  const match = resolveLicensorLeadAgentId((agents ?? []) as AgentFleetRow[], lead, licensorTenantId);

  if (match) {
    await supabase
      .schema("linkaios")
      .from("projects")
      .update({ primary_agent_id: match, updated_at: new Date().toISOString() })
      .eq("id", projectId);
  }

  return { primaryAgentId: match };
}
