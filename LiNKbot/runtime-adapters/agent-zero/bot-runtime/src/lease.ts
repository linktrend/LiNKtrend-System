/**
 * Agent Zero lease bridge — delegates to LinkSkills (Wave 2.2).
 *
 * LiNKbot MUST NOT issue capability leases directly (CONTRACTS_MVO §6.2).
 */

import type { Env } from "@linktrend/shared-config";

import type { AgentZeroAdapterConfig, AgentZeroSessionContext } from "./types.js";
import { addAgentZeroLeaseRef, updateAgentZeroSessionState } from "./session.js";

export async function requestAgentZeroLease(
  env: Env,
  session: AgentZeroSessionContext,
  capability: string,
  arguments_: Record<string, unknown>,
  config: AgentZeroAdapterConfig,
): Promise<string | null> {
  updateAgentZeroSessionState(session.session_id, "lease_pending");

  const idempotencyKey = `az-${session.session_id}-${capability}`;
  const body = {
    tenant_id: session.tenant_id,
    run_id: session.run_id,
    stage_id: session.stage_id,
    capability,
    arguments: arguments_,
    idempotency_key: idempotencyKey,
    actor: { actor_kind: "bot", actor_id: session.role_id },
  };

  if (!env.LINKSKILLS_ENDPOINT && process.env.NODE_ENV === "test") {
    const mockLeaseId = `lease-az-mock-${session.session_id.slice(0, 8)}`;
    addAgentZeroLeaseRef(session.session_id, mockLeaseId);
    return mockLeaseId;
  }

  try {
    const endpoint = config.linkskills_endpoint.replace(/\/+$/, "");
    const res = await fetch(`${endpoint}/lease/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { lease_id?: string };
    if (data.lease_id) {
      addAgentZeroLeaseRef(session.session_id, data.lease_id);
      return data.lease_id;
    }
  } catch {
    return null;
  }

  return null;
}
