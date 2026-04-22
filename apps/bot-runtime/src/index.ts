import os from "node:os";

import {
  buildLinktrendGovernancePayload,
  closeWorkerSession,
  ensureWorkerAgent,
  fetchSkillExecutionPackageFromLiNKaios,
  openWorkerSession,
  pulseWorkerSession,
  recordTrace,
} from "@linktrend/linklogic-sdk";
import { log } from "@linktrend/observability";
import { botRuntimeOpenClawTimeoutMs, loadEnv } from "@linktrend/shared-config";

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
    const { payload: governance } = await buildLinktrendGovernancePayload(env, {
      correlationId: sessionId,
      skillName,
      missionId: env.BOT_RUNTIME_MISSION_ID ?? null,
      requireApprovedSkill: true,
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

    const baseUrl = env.LINKTREND_PUBLIC_BASE_URL?.trim();
    const skillsSecret = (env.BOT_SKILLS_API_SECRET ?? env.BOT_BRAIN_API_SECRET)?.trim();
    if (baseUrl && skillsSecret) {
      const layer3 = await fetchSkillExecutionPackageFromLiNKaios({
        baseUrl,
        bearerSecret: skillsSecret,
        skillName,
        timeoutMs: botRuntimeOpenClawTimeoutMs(env),
      });
      log(layer3.ok ? "info" : "warn", "layer3 skill execution fetch", {
        service: "bot-runtime",
        skillName,
        ok: layer3.ok,
        ...(layer3.ok ? { hasBody: typeof layer3.data === "object" && layer3.data != null } : { message: layer3.message }),
      });
      try {
        await recordTrace(env, {
          eventType: layer3.ok ? "bot_runtime.skill_execution_ok" : "bot_runtime.skill_execution_error",
          payload: {
            sessionId,
            skillName,
            ...(layer3.ok ? { keys: typeof layer3.data === "object" && layer3.data ? Object.keys(layer3.data as object).slice(0, 12) : [] } : { message: layer3.message.slice(0, 400) }),
          },
        });
      } catch {
        /* best-effort */
      }
    } else {
      log("info", "layer3 skill execution skipped (set LINKTREND_PUBLIC_BASE_URL and BOT_SKILLS_API_SECRET or BOT_BRAIN_API_SECRET)", {
        service: "bot-runtime",
        skillName,
      });
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
