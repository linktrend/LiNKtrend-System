import {
  buildOpenClawAgentIngressBody,
  writeBrainAuditEvent,
  type AuditEvent,
} from "@linktrend/linklogic-sdk";
import { loadEnv, type Env } from "@linktrend/shared-config";
import type { LinktrendGovernancePayload } from "@linktrend/shared-types";
import { botRuntimeOpenClawTimeoutMs } from "@linktrend/shared-config";

export async function postLinksuitegenOpenClawRun(
  env: Env,
  governance: LinktrendGovernancePayload,
  message: string,
  options?: { roleId?: string; agentId?: string },
): Promise<{ ok: boolean; status: number; text: string; model_run_id?: string }> {
  const url = env.OPENCLAW_AGENT_RUN_URL?.trim();
  if (!url) {
    return { ok: false, status: 0, text: "OPENCLAW_AGENT_RUN_URL not set" };
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  if (env.OPENCLAW_RUN_AUTH_BEARER?.trim()) {
    headers.authorization = `Bearer ${env.OPENCLAW_RUN_AUTH_BEARER.trim()}`;
  }

  const body: Record<string, unknown> = {
    ...buildOpenClawAgentIngressBody(env, governance),
    message,
  };
  const agentId =
    options?.agentId?.trim() ||
    (options?.roleId ? agentIdForLinksuitegenRole(options.roleId) : null);
  if (agentId) {
    body.agentId = agentId;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(botRuntimeOpenClawTimeoutMs(env)),
    });
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      text: text.slice(0, 4000),
      model_run_id: res.ok ? `openclaw-${Date.now()}` : undefined,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, text: msg.slice(0, 4000) };
  }
}

/**
 * Fleet v1 mappings — canonical source: LiNKbot/roles/suites/linksuitegen/openclaw-mapping.ts
 * Orchestrator roles → admin-openclaw; factory analyst roles → Agent Zero (no OpenClaw).
 */
const LINKSUITEGEN_ORCHESTRATOR_ROLE_TO_AGENT: Record<string, string> = {
  suitegen_orchestrator_linkbot: "admin-openclaw",
  handoff_coordinator_linkbot: "admin-openclaw",
};

export function agentIdForLinksuitegenRole(roleId: string): string | null {
  return LINKSUITEGEN_ORCHESTRATOR_ROLE_TO_AGENT[roleId] ?? null;
}

export async function emitMachineReviewAudit(
  env: Env,
  input: {
    tenant_id: string;
    run_id: string;
    action: AuditEvent["action"];
    payload: Record<string, unknown>;
  },
): Promise<string> {
  const event: AuditEvent = {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: input.tenant_id,
    plane: "linkaios",
    actor: { actor_kind: "plugin", actor_id: "linksuitegen.machine_review" },
    action: input.action,
    subject: { run_id: input.run_id, stage_id: "machine_review" },
    refs: {},
    payload: input.payload,
    schema_version: "1",
  };
  const result = await writeBrainAuditEvent(env, event);
  if (result.failure) {
    throw new Error(result.failure.message);
  }
  return result.event_id;
}

export function loadLinksuitegenEnv(): Env {
  return loadEnv();
}
