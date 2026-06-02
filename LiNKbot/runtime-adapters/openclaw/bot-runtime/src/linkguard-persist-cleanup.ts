/**
 * Persist LiNKguard cleanup audit after each bot session (VPS sidecar correlation).
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { Env } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";
import { cleanupBotSessionWithLinkguard } from "./linkguard-cleanup.js";

export async function persistLinkguardSessionCleanup(
  env: Env,
  params: {
    session_id: string;
    tenant_id: string;
    role_id: string;
    lease_ids: string[];
    audit_event_ids: string[];
  },
): Promise<void> {
  const wipe = cleanupBotSessionWithLinkguard(params.session_id);

  if (!env.SUPABASE_SECRET_KEY || !env.NEXT_PUBLIC_SUPABASE_URL) {
    log("debug", "linkguard cleanup skipped (no Supabase)", { service: "bot-runtime" });
    return;
  }

  try {
    const client = createSupabaseServiceClient(env);
    const { error } = await client.schema("linkguard").from("cleanup_events").insert({
      worker_session_id: params.session_id,
      action: "bot_session_cleanup",
      detail: {
        source: "bot-runtime",
        tenant_id: params.tenant_id,
        role_id: params.role_id,
        skill_traces_wiped: wipe.skill_traces_wiped,
        wiped_skill_ids: wipe.wiped_skill_ids,
        lease_ids: params.lease_ids,
        audit_event_ids: params.audit_event_ids,
      },
    });
    if (error) {
      log("warn", "linkguard cleanup_events insert failed", {
        service: "bot-runtime",
        message: error.message,
      });
    }
  } catch (error) {
    log("warn", "linkguard cleanup persist failed", {
      service: "bot-runtime",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
