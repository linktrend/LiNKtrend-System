import type { Env } from "@linktrend/shared-config";
import type { LinktrendGovernancePayload } from "@linktrend/shared-types";
import { wrapGovernanceForOpenClaw } from "@linktrend/linklogic-sdk";

/**
 * POST `{ linktrendGovernance }` to a configured OpenClaw (or shim) HTTP endpoint.
 * URL and auth come from env — see README OpenClaw integration.
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

  const body = wrapGovernanceForOpenClaw(payload);
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return { ok: res.ok, status: res.status, text: text.slice(0, 4000) };
}
