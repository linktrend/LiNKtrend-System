/**
 * LinkSkills kill switch management.
 *
 * Implements §6.2 kill switch contract:
 * - Trip/reset switches per capability (global or tenant-scoped)
 * - Check switch state before granting leases
 * - Deny with LEASE_KILL_SWITCH without state mutation
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { KillSwitchRow, KillSwitchState } from "./types.js";

/**
 * Check if a kill switch is tripped for a capability.
 * Checks both tenant-specific and global kill switches.
 */
export async function isKillSwitchTripped(
  client: SupabaseClient,
  capability_id: string,
  tenant_id: string,
): Promise<boolean> {
  const { data, error } = await client
    .schema("linkskills")
    .rpc("is_kill_switch_tripped", {
      p_capability_id: capability_id,
      p_tenant_id: tenant_id,
    });

  if (error) {
    // Fail closed: if we can't check, assume tripped for safety
    console.error("Kill switch check failed:", error.message);
    return true;
  }

  return Boolean(data);
}

/**
 * Trip a kill switch for a capability.
 * If tenant_id is null, trips the global switch.
 */
export async function tripKillSwitch(
  client: SupabaseClient,
  params: {
    capability_id: string;
    tenant_id?: string | null;
    reason?: string;
    actor_id: string;
  },
): Promise<{ ok: boolean; error?: Error }> {
  const { data, error } = await client
    .schema("linkskills")
    .rpc("trip_kill_switch", {
      p_capability_id: params.capability_id,
      p_tenant_id: params.tenant_id ?? null,
      p_reason: params.reason ?? "",
      p_actor_id: params.actor_id,
    });

  if (error) {
    return { ok: false, error: new Error(error.message) };
  }

  return { ok: Boolean(data) };
}

/**
 * Reset (open) a kill switch for a capability.
 */
export async function resetKillSwitch(
  client: SupabaseClient,
  params: {
    capability_id: string;
    tenant_id?: string | null;
    actor_id: string;
  },
): Promise<{ ok: boolean; error?: Error }> {
  const { data, error } = await client
    .schema("linkskills")
    .rpc("reset_kill_switch", {
      p_capability_id: params.capability_id,
      p_tenant_id: params.tenant_id ?? null,
      p_actor_id: params.actor_id,
    });

  if (error) {
    return { ok: false, error: new Error(error.message) };
  }

  return { ok: Boolean(data) };
}

/**
 * Get kill switch state for a capability (tenant-aware).
 * Returns 'tripped' if either global or tenant-specific switch is tripped.
 */
export async function getKillSwitchState(
  client: SupabaseClient,
  capability_id: string,
  tenant_id: string,
): Promise<KillSwitchState> {
  const tripped = await isKillSwitchTripped(client, capability_id, tenant_id);
  return tripped ? "tripped" : "open";
}

/**
 * List all kill switches for a tenant (including global).
 */
export async function listKillSwitches(
  client: SupabaseClient,
  tenant_id: string,
): Promise<{ data: KillSwitchRow[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("capability_kill_switches")
    .select("*")
    .or(`tenant_id.eq.${tenant_id},tenant_id.is.null`)
    .order("updated_at", { ascending: false });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data ?? []) as KillSwitchRow[], error: null };
}

/**
 * Get a single kill switch row.
 */
export async function getKillSwitch(
  client: SupabaseClient,
  capability_id: string,
  tenant_id?: string | null,
): Promise<{ data: KillSwitchRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("capability_kill_switches")
    .select("*")
    .eq("capability_id", capability_id)
    .is("tenant_id", tenant_id ?? null)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: (data ?? null) as KillSwitchRow | null, error: null };
}
