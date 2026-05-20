export type KillSwitchLevel = 1 | 2 | 3;

export type KillSwitchStateV2 = "open" | "tripped";

export interface KillSwitchConfig {
  level: KillSwitchLevel;
  state: KillSwitchStateV2;
  tenant_id: string | null;
  capability: string | null;
  trigger_reason: string | null;
  triggered_by: string | null;
  triggered_at: string | null;
  reset_at: string | null;
  reset_by: string | null;
}

export interface SafetyTriggerInput {
  spend_15m_usd: number;
  spend_24h_avg_15m_usd: number;
  projected_month_end_usd: number;
  projected_month_end_window_hits: number;
  burn_rate_window_minutes: number;
  critical_exceptions_10m: number;
  invalid_signature_or_replay_5m: number;
  invalid_signature_source: string | null;
  credential_compromise_signal: boolean;
  pass_rate: number;
  pass_rate_sample_count: number;
}
