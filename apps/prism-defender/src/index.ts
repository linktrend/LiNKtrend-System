import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

import { sweepWorkerResidue } from "./residue-sweep.js";

const HEARTBEAT_MS = Number(process.env.PRISM_HEARTBEAT_MS ?? 60_000);
const RESIDUE_BATCH = Number(process.env.PRISM_RESIDUE_BATCH ?? 25);
const RESIDUE_SWEEP_DISABLED = process.env.PRISM_RESIDUE_SWEEP?.trim() === "0";

async function recordHeartbeat(env: ReturnType<typeof loadEnv>) {
  const client = createSupabaseServiceClient(env);
  const { error } = await client.schema("prism").from("cleanup_events").insert({
    action: "sidecar_heartbeat",
    detail: { ts: new Date().toISOString(), pid: process.pid },
  });
  if (error) {
    log("warn", "prism heartbeat insert failed", {
      service: "prism-defender",
      message: error.message,
    });
    return;
  }
  log("debug", "prism heartbeat recorded", { service: "prism-defender" });
}

async function tick(env: ReturnType<typeof loadEnv>) {
  await recordHeartbeat(env);
  if (!RESIDUE_SWEEP_DISABLED) {
    await sweepWorkerResidue(env, { batch: RESIDUE_BATCH });
  }
}

async function main() {
  const env = loadEnv();
  log("info", "prism-defender sidecar active", {
    service: "prism-defender",
    heartbeatMs: HEARTBEAT_MS,
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
