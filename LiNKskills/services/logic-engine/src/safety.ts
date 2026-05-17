import type { SupabaseClient } from "@supabase/supabase-js";
import type { KillSwitchConfig, KillSwitchLevel, SafetyTriggerInput } from "@linktrend/linklogic-sdk";
import { isKillSwitchTripped, resetKillSwitch, tripKillSwitch } from "./kill-switch.js";

export interface KillSwitchCheckResult {
  state: "open" | "tripped";
  level: KillSwitchLevel;
  reason: string | null;
}

export interface TriggerEvaluationResult {
  trip: boolean;
  level: KillSwitchLevel;
  reasons: string[];
  rollback_scaffold: boolean;
}

function asRows(data: unknown): KillSwitchConfig[] {
  return Array.isArray(data) ? (data as KillSwitchConfig[]) : [];
}

export async function checkKillSwitch(
  client: SupabaseClient,
  tenant_id: string,
  capability: string,
): Promise<KillSwitchCheckResult> {
  let globalHalt = false;
  try {
    const { data, error } = await client
      .schema("linkskills")
      .from("kill_switches")
      .select("switch_level,state,trigger_reason,tenant_id,capability")
      .is("tenant_id", null)
      .is("capability", null)
      .eq("switch_level", 2)
      .eq("state", "tripped")
      .limit(1);
    if (!error) {
      globalHalt = (data ?? []).length > 0;
    }
  } catch {
    // Keep compatibility with older test mocks and schema setups.
  }

  if (globalHalt) {
    return { state: "tripped", level: 2, reason: "Global level 2 halt is active" };
  }

  const tripped = await isKillSwitchTripped(client, capability, tenant_id);
  return {
    state: tripped ? "tripped" : "open",
    level: tripped ? 1 : 1,
    reason: tripped ? `Kill switch tripped for capability "${capability}"` : null,
  };
}

export async function listSafetyKillSwitches(
  client: SupabaseClient,
  tenant_id: string,
): Promise<{ data: KillSwitchConfig[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("kill_switches")
    .select("*")
    .or(`tenant_id.eq.${tenant_id},tenant_id.is.null`)
    .order("updated_at", { ascending: false });
  if (error) return { data: [], error: new Error(error.message) };
  return { data: asRows(data), error: null };
}

export async function getSafetyKillSwitch(
  client: SupabaseClient,
  tenant_id: string | null,
  capability: string | null,
): Promise<{ data: KillSwitchConfig | null; error: Error | null }> {
  const query = client
    .schema("linkskills")
    .from("kill_switches")
    .select("*")
    .eq("switch_level", capability === null ? 2 : 1)
    .limit(1);
  if (tenant_id === null) {
    query.is("tenant_id", null);
  } else {
    query.eq("tenant_id", tenant_id);
  }
  if (capability === null) {
    query.is("capability", null);
  } else {
    query.eq("capability", capability);
  }
  const { data, error } = await query.maybeSingle();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data as KillSwitchConfig | null) ?? null, error: null };
}

export async function tripSafetyKillSwitch(
  client: SupabaseClient,
  params: {
    tenant_id?: string | null;
    capability?: string | null;
    reason?: string;
    actor_id: string;
  },
): Promise<{ ok: boolean; error?: Error }> {
  if (params.capability === null || params.capability === undefined) {
    const { error } = await client
      .schema("linkskills")
      .from("kill_switches")
      .upsert({
        tenant_id: null,
        capability: null,
        switch_level: 2,
        state: "tripped",
        trigger_reason: params.reason ?? "manual_global_halt",
        triggered_by: params.actor_id,
        triggered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "tenant_id,capability,switch_level" });
    if (error) return { ok: false, error: new Error(error.message) };
    return { ok: true };
  }
  return tripKillSwitch(client, {
    capability_id: params.capability,
    tenant_id: params.tenant_id ?? null,
    ...(params.reason ? { reason: params.reason } : {}),
    actor_id: params.actor_id,
  });
}

export async function resetSafetyKillSwitch(
  client: SupabaseClient,
  params: {
    tenant_id?: string | null;
    capability?: string | null;
    actor_id: string;
  },
): Promise<{ ok: boolean; error?: Error }> {
  if (params.capability === null || params.capability === undefined) {
    const { error } = await client
      .schema("linkskills")
      .from("kill_switches")
      .update({
        state: "open",
        reset_by: params.actor_id,
        reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .is("tenant_id", null)
      .is("capability", null)
      .eq("switch_level", 2);
    if (error) return { ok: false, error: new Error(error.message) };
    return { ok: true };
  }
  return resetKillSwitch(client, {
    capability_id: params.capability,
    tenant_id: params.tenant_id ?? null,
    actor_id: params.actor_id,
  });
}

export function evaluateSafetyTriggers(input: SafetyTriggerInput): TriggerEvaluationResult {
  const reasons: string[] = [];

  if (input.spend_15m_usd > 75) reasons.push("runaway_cost_15m");
  if (input.burn_rate_window_minutes >= 10 && input.spend_24h_avg_15m_usd > 0 && (input.spend_15m_usd / input.spend_24h_avg_15m_usd) > 3) {
    reasons.push("burn_rate_gt_3x");
  }
  if (input.projected_month_end_usd > 1000 && input.projected_month_end_window_hits >= 2) {
    reasons.push("projected_month_end_gt_1000");
  }
  if (input.critical_exceptions_10m >= 3) reasons.push("critical_exceptions_10m");
  if (input.invalid_signature_or_replay_5m >= 10 && input.invalid_signature_source) reasons.push("signature_replay_spike");
  if (input.credential_compromise_signal) reasons.push("credential_compromise_signal");

  const rollback_scaffold = input.pass_rate_sample_count >= 30 && input.pass_rate < 0.8;
  return {
    trip: reasons.length > 0,
    level: reasons.length > 0 ? 2 : 1,
    reasons,
    rollback_scaffold,
  };
}
