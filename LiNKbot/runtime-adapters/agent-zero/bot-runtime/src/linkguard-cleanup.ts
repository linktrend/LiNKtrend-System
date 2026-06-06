/**
 * LiNKguard residue cleanup hook for Agent Zero runs (Wave 2.7).
 *
 * Persists one `linkguard.cleanup_events` row per AZ session termination.
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { Env } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";

export type AgentZeroCleanupParams = {
  session_id: string;
  tenant_id: string;
  role_id: string;
  lane_id: string;
  lease_ids: string[];
  audit_event_ids: string[];
};

export async function persistAgentZeroLinkguardCleanup(
  env: Env,
  params: AgentZeroCleanupParams,
): Promise<void> {
  if (!env.SUPABASE_SECRET_KEY || !env.NEXT_PUBLIC_SUPABASE_URL) {
    log("debug", "agent-zero linkguard cleanup skipped (no Supabase)", {
      service: "agent-zero-runtime",
    });
    return;
  }

  try {
    const client = createSupabaseServiceClient(env);
    const { error } = await client.schema("linkguard").from("cleanup_events").insert({
      worker_session_id: params.session_id,
      action: "agent_zero_session_cleanup",
      detail: {
        source: "agent-zero-runtime",
        tenant_id: params.tenant_id,
        role_id: params.role_id,
        lane_id: params.lane_id,
        lease_ids: params.lease_ids,
        audit_event_ids: params.audit_event_ids,
      },
    });
    if (error) {
      log("warn", "agent-zero linkguard cleanup_events insert failed", {
        service: "agent-zero-runtime",
        message: error.message,
      });
    }
  } catch (error) {
    log("warn", "agent-zero linkguard cleanup persist failed", {
      service: "agent-zero-runtime",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
