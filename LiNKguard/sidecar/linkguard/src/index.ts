import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

import { pruneOldHeartbeats } from "./heartbeat-retention.js";
import { sweepWorkerResidue } from "./residue-sweep.js";

const HEARTBEAT_MS = Number(
  process.env.LINKGUARD_HEARTBEAT_MS ?? process.env.PRISM_HEARTBEAT_MS ?? 60_000,
);
const RESIDUE_BATCH = Number(process.env.LINKGUARD_RESIDUE_BATCH ?? process.env.PRISM_RESIDUE_BATCH ?? 25);
const RESIDUE_SWEEP_DISABLED =
  (process.env.LINKGUARD_RESIDUE_SWEEP ?? process.env.PRISM_RESIDUE_SWEEP)?.trim() === "0";

async function recordHeartbeat(env: ReturnType<typeof loadEnv>) {
  const client = createSupabaseServiceClient(env);
  const { error } = await client.schema("linkguard").from("cleanup_events").insert({
    action: "sidecar_heartbeat",
    detail: { ts: new Date().toISOString(), pid: process.pid, source: "linkguard" },
  });
  if (error) {
    log("warn", "linkguard heartbeat insert failed", {
      service: "linkguard",
      message: error.message,
    });
    return;
  }
  log("debug", "linkguard heartbeat recorded", { service: "linkguard" });
}

async function tick(env: ReturnType<typeof loadEnv>) {
  await recordHeartbeat(env);
  await pruneOldHeartbeats(env);
  if (!RESIDUE_SWEEP_DISABLED) {
    await sweepWorkerResidue(env, { batch: RESIDUE_BATCH });
  }
}

async function main() {
  const env = loadEnv();
  log("info", "linkguard sidecar active", {
    service: "linkguard",
    heartbeatMs: HEARTBEAT_MS,
    retentionDays: env.LINKGUARD_RETENTION_DAYS ?? env.PRISM_RETENTION_DAYS ?? "(default 14)",
    residueSweep: !RESIDUE_SWEEP_DISABLED,
    residueBatch: RESIDUE_BATCH,
  });

  await tick(env);
  setInterval(() => {
    void tick(env);
  }, HEARTBEAT_MS);

  process.once("SIGINT", () => process.exit(0));
  process.once("SIGTERM", () => process.exit(0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
