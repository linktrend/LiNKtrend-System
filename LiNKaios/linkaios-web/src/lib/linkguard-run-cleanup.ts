import "server-only";

import { sweepWorkerResidue } from "../../../../LiNKguard/sidecar/linkguard/src/residue-sweep";
import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

const DEFAULT_BATCH = 25;

export type LinkguardManualCleanupResult = {
  acknowledged: number;
};

/**
 * Operator-triggered residue sweep — same path as the LiNKguard sidecar tick.
 */
export async function runLinkguardManualCleanup(params?: {
  batch?: number;
  requestedBy?: string;
}): Promise<LinkguardManualCleanupResult> {
  const env = loadEnv();
  const batch = params?.batch ?? DEFAULT_BATCH;
  const acknowledged = await sweepWorkerResidue(env, { batch });

  try {
    const client = createSupabaseServiceClient(env);
    const { error } = await client.schema("linkguard").from("cleanup_events").insert({
      action: "manual_cleanup_run",
      detail: {
        source: "linkaios-admin",
        acknowledged,
        batch,
        requested_by: params?.requestedBy ?? null,
      },
    });
    if (error) {
      log("warn", "manual_cleanup_run audit insert failed", {
        service: "linkaios-web",
        message: error.message,
      });
    }
  } catch (e) {
    log("warn", "manual_cleanup_run audit failed", {
      service: "linkaios-web",
      error: String(e),
    });
  }

  return { acknowledged };
}
