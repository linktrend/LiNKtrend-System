import type { Env } from "@linktrend/shared-config";
import type { LeaseExecuteRequest, LeaseExecuteResult } from "@linktrend/linklogic-sdk";
import { executeGrantedLease, resolveCapabilityFromIdempotencyKey } from "@linktrend/linkskills-logic-engine";

/**
 * Production gate: kernel must not fabricate capability results when required.
 */
export function isLinkSkillsExecutionGateRequired(env: Env): boolean {
  const explicit = env.LINKSKILLS_EXECUTION_GATE;
  if (explicit === "required") return true;
  if (explicit === "permissive") return false;
  return env.NODE_ENV === "production";
}

export async function executeLeaseThroughLogicEngine(
  env: Env,
  request: LeaseExecuteRequest,
): Promise<LeaseExecuteResult> {
  return executeGrantedLease(env, request);
}

export function parseCapabilityFromExecuteRequest(request: LeaseExecuteRequest): string {
  return resolveCapabilityFromIdempotencyKey(request.idempotency_key);
}
