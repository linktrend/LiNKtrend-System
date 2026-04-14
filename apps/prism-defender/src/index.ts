import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

const HEARTBEAT_MS = Number(process.env.PRISM_HEARTBEAT_MS ?? 60_000);

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

async function main() {
  const env = loadEnv();
  log("info", "prism-defender sidecar active", {
    service: "prism-defender",
    heartbeatMs: HEARTBEAT_MS,
  });

  await recordHeartbeat(env);
  setInterval(() => {
    void recordHeartbeat(env);
  }, HEARTBEAT_MS);

  process.once("SIGINT", () => process.exit(0));
  process.once("SIGTERM", () => process.exit(0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
