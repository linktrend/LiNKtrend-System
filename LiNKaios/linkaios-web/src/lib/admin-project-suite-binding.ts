import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  adminProcessById,
  adminProcessesForSuite,
  ADMIN_VENDOR_SUITES,
} from "@/lib/admin-suite-templates";
import type { AdminProjectType } from "@/lib/admin-project-types";
import { resolveAdminProjectCreatePreset } from "@/lib/admin-project-types";

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

/** First agent executor name from the module template — used to resolve lead LiNKbot. */
export function adminLeadAgentDisplayName(projectType: AdminProjectType): string {
  const preset = resolveAdminProjectCreatePreset(projectType);
  const module = adminProcessById(preset.moduleIds[0]);
  const firstAgent = module?.workflows
    ?.flatMap((w) => w.issues)
    .flatMap((i) => i.executors)
    .find((e) => e.kind === "agent");
  return firstAgent?.name ?? "LiNKbot";
}

/**
 * After create_project, bind suite template metadata: primary_agent_id when a fleet agent matches.
 */
export async function bindAdminProjectSuiteTemplate(
  supabase: SupabaseClient,
  projectId: string,
  projectType: AdminProjectType,
): Promise<{ primaryAgentId: string | null }> {
  const leadName = adminLeadAgentDisplayName(projectType);
  const { data: agents } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("id, display_name")
    .ilike("display_name", `%${leadName.split(" ")[0]}%`)
    .limit(5);

  const match =
    agents?.find((a) => a.display_name?.toLowerCase() === leadName.toLowerCase()) ??
    agents?.[0] ??
    null;

  if (match?.id) {
    await supabase
      .schema("linkaios")
      .from("projects")
      .update({ primary_agent_id: match.id, updated_at: new Date().toISOString() })
      .eq("id", projectId);
  }

  return { primaryAgentId: match?.id ?? null };
}
