/**
 * LinkSkills Lease Adapter
 *
 * Per CONTRACTS_MVO.md §6.2 - LiNKbot MUST NOT issue capability leases directly.
 * This adapter provides the integration surface for lease requests through LinkSkills.
 */

import {
  LeaseRequest,
  LeaseDecision,
  LeaseExecuteRequest,
  LeaseExecuteResult,
  FailureReport,
  FailureCode,
} from "./local-types.js";
import { BotLeaseRequest } from "./types.js";

/**
 * Lease adapter configuration
 */
export interface LeaseAdapterConfig {
  linkskills_endpoint: string;
  default_ttl_seconds: number;
  request_timeout_ms: number;
}

/**
 * Default lease adapter config
 */
export const DEFAULT_LEASE_CONFIG: LeaseAdapterConfig = {
  linkskills_endpoint: process.env.LINKSKILLS_ENDPOINT || "http://localhost:3002",
  default_ttl_seconds: 300, // 5 minutes
  request_timeout_ms: 10000,
};

/**
 * Lease adapter error types
 */
export class LeaseAdapterError extends Error {
  constructor(
    message: string,
    public code: FailureCode,
    public lease_request?: BotLeaseRequest
  ) {
    super(message);
    this.name = "LeaseAdapterError";
  }
}

/**
 * Request a capability lease from LinkSkills
 */
export async function requestLease(
  bot_request: BotLeaseRequest,
  config: LeaseAdapterConfig = DEFAULT_LEASE_CONFIG
): Promise<LeaseDecision> {
  const lease_request: LeaseRequest = {
    tenant_id: bot_request.tenant_id,
    run_id: bot_request.run_id,
    stage_id: bot_request.stage_id,
    capability: bot_request.capability,
    arguments: bot_request.arguments,
    idempotency_key: bot_request.idempotency_key,
    actor: {
      actor_kind: "bot",
      actor_id: bot_request.requested_by_role,
    },
  };

  try {
    // In development mode, simulate lease grant
    if (process.env.NODE_ENV === "development" && process.env.MOCK_LEASES === "true") {
      return {
        lease_id: `lease-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: "granted",
        expires_at: new Date(Date.now() + config.default_ttl_seconds * 1000).toISOString(),
        kill_switch_state: "open",
      };
    }

    // Real LinkSkills integration
    const response = await fetch(`${config.linkskills_endpoint}/leases/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lease_request),
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });

    if (!response.ok) {
      throw new LeaseAdapterError(
        `LinkSkills request failed: ${response.status}`,
        "INTEGRATION_UNAVAILABLE",
        bot_request
      );
    }

    const decision = (await response.json()) as LeaseDecision;
    return decision;
  } catch (error: unknown) {
    if (error instanceof LeaseAdapterError) {
      throw error;
    }

    const failure: FailureReport = {
      code: "INTEGRATION_UNAVAILABLE",
      plane: "linkbot",
      message: error instanceof Error ? error.message : "Unknown lease request error",
      retryable: true,
      occurred_at: new Date().toISOString(),
    };

    return {
      lease_id: `failed-${Date.now()}`,
      status: "denied",
      reason: failure.message,
      kill_switch_state: "open",
      failure,
    };
  }
}

/**
 * Execute a granted lease
 */
export async function executeLease(
  lease_id: string,
  idempotency_key: string,
  config: LeaseAdapterConfig = DEFAULT_LEASE_CONFIG
): Promise<LeaseExecuteResult> {
  const execute_request: LeaseExecuteRequest = {
    lease_id,
    idempotency_key,
  };

  try {
    // In development mode, simulate execution
    if (process.env.NODE_ENV === "development" && process.env.MOCK_LEASES === "true") {
      return {
        lease_id,
        capability: "mock.capability",
        result: { status: "mock_executed" },
        ledger_entry_id: `ledger-${Date.now()}`,
        audit_event_id: `audit-${Date.now()}`,
      };
    }

    const response = await fetch(`${config.linkskills_endpoint}/leases/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(execute_request),
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });

    if (!response.ok) {
      throw new LeaseAdapterError(
        `LinkSkills execution failed: ${response.status}`,
        "LEASE_REQUEST_INVALID"
      );
    }

    const result = (await response.json()) as LeaseExecuteResult;
    return result;
  } catch (error: unknown) {
    if (error instanceof LeaseAdapterError) {
      throw error;
    }

    const failure: FailureReport = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkbot",
      message: error instanceof Error ? error.message : "Unknown lease execution error",
      retryable: true,
      occurred_at: new Date().toISOString(),
    };

    return {
      lease_id,
      capability: "unknown",
      result: {},
      ledger_entry_id: `failed-${Date.now()}`,
      audit_event_id: `audit-failed-${Date.now()}`,
      failure,
    };
  }
}

/**
 * Check lease status
 */
export async function checkLeaseStatus(
  lease_id: string,
  config: LeaseAdapterConfig = DEFAULT_LEASE_CONFIG
): Promise<LeaseDecision | null> {
  try {
    const response = await fetch(`${config.linkskills_endpoint}/leases/${lease_id}/status`, {
      method: "GET",
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });

    if (!response.ok) {
      return null;
    }

    const decision = (await response.json()) as LeaseDecision;
    return decision;
  } catch {
    return null;
  }
}

/**
 * Batch request multiple leases
 */
export async function requestLeasesBatch(
  requests: BotLeaseRequest[],
  config: LeaseAdapterConfig = DEFAULT_LEASE_CONFIG
): Promise<LeaseDecision[]> {
  const decisions = await Promise.all(
    requests.map((req) => requestLease(req, config).catch((err) => err as LeaseAdapterError))
  );

  return decisions.map((decision) => {
    if (decision instanceof LeaseAdapterError) {
      return {
        lease_id: `failed-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: "denied" as const,
        reason: decision.message,
        kill_switch_state: "open" as const,
        failure: {
          code: decision.code,
          plane: "linkbot",
          message: decision.message,
          retryable: true,
          occurred_at: new Date().toISOString(),
        },
      };
    }
    return decision;
  });
}

/**
 * Validate lease is still valid for execution
 */
export function isLeaseValid(decision: LeaseDecision): boolean {
  if (decision.status !== "granted") {
    return false;
  }

  if (decision.kill_switch_state === "tripped") {
    return false;
  }

  if (decision.expires_at && new Date(decision.expires_at) < new Date()) {
    return false;
  }

  return true;
}

/**
 * Build idempotency key for lease requests
 */
export function buildLeaseIdempotencyKey(
  run_id: string,
  stage_id: string,
  capability: string
): string {
  return `${run_id}:${stage_id}:${capability}`;
}
