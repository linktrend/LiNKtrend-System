/**
 * LinkSkills capability catalog.
 *
 * Implements §7 capability catalog contract:
 * - Catalog of available capabilities with policy modes
 * - Args/result schemas for validation
 * - Tenant-scoped vs global capabilities
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CapabilityCatalogRow } from "./types.js";

/**
 * Get a capability from the catalog.
 */
export async function getCapability(
  client: SupabaseClient,
  capability_id: string,
): Promise<{ data: CapabilityCatalogRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("capability_catalog")
    .select("*")
    .eq("capability_id", capability_id)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: (data ?? null) as CapabilityCatalogRow | null, error: null };
}

/**
 * Check if a capability exists in the catalog.
 */
export async function capabilityExists(
  client: SupabaseClient,
  capability_id: string,
): Promise<boolean> {
  const { data } = await getCapability(client, capability_id);
  return data !== null;
}

/**
 * Get the effective policy mode for a capability.
 * Per §7, default is 'require_approval'.
 */
export async function getCapabilityPolicy(
  client: SupabaseClient,
  capability_id: string,
  _tenant_id?: string,  // Reserved for future tenant-specific policy overrides
): Promise<"require_approval" | "auto_grant" | "deny_all" | null> {
  const { data } = await client
    .schema("linkskills")
    .rpc("get_capability_policy", {
      p_capability_id: capability_id,
      p_tenant_id: _tenant_id ?? null,
    });

  if (!data) return null;

  const mode = String(data);
  if (["require_approval", "auto_grant", "deny_all"].includes(mode)) {
    return mode as "require_approval" | "auto_grant" | "deny_all";
  }

  return null;
}

/**
 * List all capabilities in the catalog.
 */
export async function listCapabilities(
  client: SupabaseClient,
  params: { limit?: number; tenant_scoped_only?: boolean } = {},
): Promise<{ data: CapabilityCatalogRow[]; error: Error | null }> {
  const limit = params.limit ?? 100;

  let query = client
    .schema("linkskills")
    .from("capability_catalog")
    .select("*")
    .order("capability_id", { ascending: true })
    .limit(limit);

  if (params.tenant_scoped_only) {
    query = query.eq("tenant_scoped", true);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data ?? []) as CapabilityCatalogRow[], error: null };
}

/**
 * Validate capability arguments against the catalog's args_schema.
 * Returns null if valid, or an error message if invalid.
 */
export function validateCapabilityArguments(
  _capability: CapabilityCatalogRow,
  _args: Record<string, unknown>,
): string | null {
  // TODO: Implement JSON Schema validation when schemas are formalized
  // For MVO, we rely on Zod validation at the SDK boundary (contracts-mvo.ts)
  return null;
}

/**
 * Get the MVO capability IDs.
 * Per §7: crm.upsert, plane.project.create, plane.task.create, preview.publish
 */
export function getMvoCapabilityIds(): string[] {
  return [
    "crm.upsert",
    "plane.project.create",
    "plane.task.create",
    "preview.publish",
    "cap.crm.odoo_shadow",
    "cap.payload.local_sync",
    "cap.supabase.mirror_content",
    "cap.zulip.run_messaging",
    "cap.research.public_web",
    "cap.asset.generation",
    "cap.plane.execution_tracking",
  ];
}

/**
 * Check if a capability is an MVO capability.
 */
export function isMvoCapability(capability_id: string): boolean {
  return getMvoCapabilityIds().includes(capability_id);
}

/**
 * LinkSites v2 capability IDs (§0.A.5.1).
 */
export function getLinksitesV2CapabilityIds(): string[] {
  return [
    "cap.crm.odoo_shadow",
    "cap.payload.local_sync",
    "cap.supabase.mirror_content",
    "cap.zulip.run_messaging",
    "cap.research.public_web",
    "cap.asset.generation",
    "cap.plane.execution_tracking",
  ];
}

export function isLinksitesV2Capability(capability_id: string): boolean {
  return getLinksitesV2CapabilityIds().includes(capability_id);
}

/**
 * Side-effecting LinkSites v2 capabilities.
 * `cap.research.public_web` is intentionally excluded (read-only).
 */
export function isWriteCapableLinksitesV2Capability(capability_id: string): boolean {
  return [
    "cap.crm.odoo_shadow",
    "cap.payload.local_sync",
    "cap.supabase.mirror_content",
    "cap.zulip.run_messaging",
    "cap.asset.generation",
    "cap.plane.execution_tracking",
  ].includes(capability_id);
}
