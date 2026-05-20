import { buildOpenClawAgentIngressBody } from "@linktrend/linklogic-sdk";
import { botRuntimeOpenClawTimeoutMs, type Env } from "@linktrend/shared-config";
import type { LinktrendGovernancePayload } from "@linktrend/shared-types";

function isAbortError(e: unknown): boolean {
  if (e instanceof Error && e.name === "AbortError") return true;
  if (
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    String((e as { name: unknown }).name) === "AbortError"
  ) {
    return true;
  }
  return false;
}

/**
 * POST governance to a configured OpenClaw HTTP shim or proxy.
 * Default JSON matches LiNKbot-core gateway `agent` params (`message`, `idempotencyKey`, `linktrendGovernance`, …).
 * Set `OPENCLAW_AGENT_RUN_BODY=governance_only` for `{ linktrendGovernance }` only.
 */
export async function postGovernanceToOpenClaw(
  env: Env,
  payload: LinktrendGovernancePayload,
): Promise<{ ok: boolean; status: number; text: string }> {
  const url = env.OPENCLAW_AGENT_RUN_URL;
  if (!url) {
    return { ok: false, status: 0, text: "OPENCLAW_AGENT_RUN_URL not set" };
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  if (env.OPENCLAW_RUN_AUTH_BEARER) {
    headers.authorization = `Bearer ${env.OPENCLAW_RUN_AUTH_BEARER}`;
  }

  const body = buildOpenClawAgentIngressBody(env, payload);
  const timeoutMs = botRuntimeOpenClawTimeoutMs(env);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const text = await res.text();
    return { ok: res.ok, status: res.status, text: text.slice(0, 4000) };
  } catch (e: unknown) {
    if (isAbortError(e)) {
      return { ok: false, status: 0, text: "openclaw request aborted (timeout)" };
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, text: msg.slice(0, 4000) };
  }
}
