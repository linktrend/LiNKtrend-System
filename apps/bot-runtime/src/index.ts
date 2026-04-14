import os from "node:os";

import {
  closeWorkerSession,
  ensureWorkerAgent,
  openWorkerSession,
  pulseWorkerSession,
  recordTrace,
  resolveSkillByName,
} from "@linktrend/linklogic-sdk";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

const HEARTBEAT_MS = 30_000;

async function main() {
  const env = loadEnv();
  log("info", "bot-runtime started", { service: "bot-runtime" });

  const agentId = await ensureWorkerAgent(env, {
    service: "bot-runtime",
    displayName: `LiNKbot (${os.hostname()})`,
  });

  const sessionId = await openWorkerSession(env, {
    service: "bot-runtime",
    agentId,
    metadata: { host: os.hostname(), pid: process.pid },
  });

  const pulse = setInterval(() => {
    void pulseWorkerSession(env, { service: "bot-runtime", sessionId });
  }, HEARTBEAT_MS);

  const shutdown = async (signal: string) => {
    clearInterval(pulse);
    log("info", "shutdown " + signal, { service: "bot-runtime", sessionId });
    await closeWorkerSession(env, { service: "bot-runtime", sessionId });
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    const skill = await resolveSkillByName(env, {
      service: "bot-runtime",
      skillName: "bootstrap",
    });
    log("info", "bootstrap skill lookup", {
      service: "bot-runtime",
      found: Boolean(skill),
    });
    try {
      await recordTrace(env, {
        eventType: "bot_runtime.bootstrap_skill",
        payload: { sessionId, found: Boolean(skill), skillName: "bootstrap" },
      });
    } catch {
      /* trace is best-effort */
    }
  } catch (e) {
    log("warn", "bootstrap skill lookup failed", {
      service: "bot-runtime",
      error: String(e),
    });
  }

  log("info", "bot-runtime session active; Ctrl+C to exit", {
    service: "bot-runtime",
    sessionId,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
