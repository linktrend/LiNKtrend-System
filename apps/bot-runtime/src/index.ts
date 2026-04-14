import os from "node:os";

import {
  buildLinktrendGovernancePayload,
  closeWorkerSession,
  ensureWorkerAgent,
  openWorkerSession,
  pulseWorkerSession,
  recordTrace,
} from "@linktrend/linklogic-sdk";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

import { postGovernanceToOpenClaw } from "./openclaw-handoff.js";

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

  const skillName = env.BOT_RUNTIME_SKILL_NAME ?? "bootstrap";

  try {
    const governance = await buildLinktrendGovernancePayload(env, {
      correlationId: sessionId,
      skillName,
      missionId: env.BOT_RUNTIME_MISSION_ID ?? null,
    });
    log("info", "governance built", {
      service: "bot-runtime",
      skillName,
      hasInstructions: Boolean(governance.runtimeInstructions?.text),
    });

    try {
      await recordTrace(env, {
        eventType: "bot_runtime.governance_built",
        payload: {
          sessionId,
          traceCorrelationId: governance.bootstrap?.traceCorrelationId,
          skillName,
          hasMission: Boolean(governance.mission),
        },
      });
    } catch {
      /* best-effort */
    }

    const handoff = await postGovernanceToOpenClaw(env, governance);
    if (env.OPENCLAW_AGENT_RUN_URL) {
      log(handoff.ok ? "info" : "warn", "openclaw handoff", {
        service: "bot-runtime",
        status: handoff.status,
        preview: handoff.text.slice(0, 500),
      });
      try {
        await recordTrace(env, {
          eventType: handoff.ok ? "bot_runtime.openclaw_ok" : "bot_runtime.openclaw_error",
          payload: { sessionId, status: handoff.status, bodyPreview: handoff.text.slice(0, 800) },
        });
      } catch {
        /* best-effort */
      }
    } else {
      log("info", "openclaw handoff skipped (set OPENCLAW_AGENT_RUN_URL); payload summary", {
        service: "bot-runtime",
        traceCorrelationId: governance.bootstrap?.traceCorrelationId,
        authorizationState: governance.bootstrap?.authorizationState,
        toolCount: governance.approvedTools?.toolNames?.length ?? 0,
        hasMission: Boolean(governance.mission),
        hasInstructions: Boolean(governance.runtimeInstructions?.text),
      });
    }
  } catch (e) {
    log("warn", "bootstrap / governance path failed", {
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
