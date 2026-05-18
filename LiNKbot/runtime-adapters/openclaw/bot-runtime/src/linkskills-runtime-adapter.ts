import type { FailureReport } from "@linktrend/linklogic-sdk";
import type { LinktrendGovernancePayload } from "@linktrend/shared-types";

export type LinkSkillsOperationKind = "capability.execute" | "skill.execute";

export type LinkSkillsOperationRequest = {
  kind: LinkSkillsOperationKind;
  operation_id: string;
  lease_id?: string;
  idempotency_key: string;
  payload?: Record<string, unknown>;
};

export type LeaseProjection = {
  lease_id: string;
  operation_ids: string[];
};

export type LinkSkillsOperationSuccess = {
  ok: true;
  replayed: boolean;
  lease_id: string;
  operation_id: string;
  payload?: Record<string, unknown>;
};

export type LinkSkillsOperationFailure = {
  ok: false;
  failure: FailureReport;
};

export type LinkSkillsOperationResult = LinkSkillsOperationSuccess | LinkSkillsOperationFailure;

function toFailure(code: FailureReport["code"], message: string, retryable = false): LinkSkillsOperationFailure {
  return {
    ok: false,
    failure: {
      code,
      plane: "linkskills",
      message,
      retryable,
      occurred_at: new Date().toISOString(),
    },
  };
}

function deriveAllowedOperations(governance: LinktrendGovernancePayload): Set<string> {
  const approved = governance.approvedTools?.toolNames ?? [];
  return new Set(approved.filter((name: string) => name.startsWith("cap.") || name.startsWith("skill.")));
}

/**
 * Lease-governed operation adapter for bot-runtime.
 * - allowed operation surface is governance-policy-derived (`approvedTools`)
 * - side effects require `lease_id` + `idempotency_key`
 * - idempotent replay returns the first successful result
 */
export function createLinkSkillsRuntimeAdapter(params: {
  governance: LinktrendGovernancePayload;
  leases: LeaseProjection[];
}) {
  const allowedOperations = deriveAllowedOperations(params.governance);
  const leaseMap = new Map(params.leases.map((lease) => [lease.lease_id, new Set(lease.operation_ids)]));
  const replayCache = new Map<string, LinkSkillsOperationSuccess>();

  function execute(request: LinkSkillsOperationRequest): LinkSkillsOperationResult {
    if (!request.lease_id) {
      return toFailure("LEASE_REQUEST_INVALID", `Missing lease_id for ${request.kind}:${request.operation_id}`);
    }

    if (!allowedOperations.has(request.operation_id)) {
      return toFailure("LEASE_DENIED", `Operation not approved by governance policy: ${request.operation_id}`);
    }

    const leaseOps = leaseMap.get(request.lease_id);
    if (!leaseOps || !leaseOps.has(request.operation_id)) {
      return toFailure("LEASE_DENIED", `Lease does not grant operation: ${request.operation_id}`);
    }

    const prior = replayCache.get(request.idempotency_key);
    if (prior) {
      if (prior.lease_id !== request.lease_id || prior.operation_id !== request.operation_id) {
        return toFailure(
          "LEASE_IDEMPOTENCY_CONFLICT",
          `Idempotency key already used for ${prior.operation_id} on lease ${prior.lease_id}`,
        );
      }
      return { ...prior, replayed: true };
    }

    const success: LinkSkillsOperationSuccess = {
      ok: true,
      replayed: false,
      lease_id: request.lease_id,
      operation_id: request.operation_id,
      payload: request.payload,
    };
    replayCache.set(request.idempotency_key, success);
    return success;
  }

  return {
    execute,
    allowed_operation_ids: [...allowedOperations].sort(),
  };
}
