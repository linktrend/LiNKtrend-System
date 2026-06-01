import type { FailureReport } from "@linktrend/linklogic-sdk";
import type { LinktrendGovernancePayload } from "@linktrend/shared-types";

export type LinkSkillsOperationKind = "capability.execute" | "skill.execute";
export type SkillDisclosureFragmentType =
  | "decision_tree"
  | "phase_instructions"
  | "contracts"
  | "tool_specs";

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

export type SkillDisclosureRequest = {
  lease_id?: string;
  idempotency_key: string;
  requested_skill_ids: string[];
  requested_fragment_types?: Array<SkillDisclosureFragmentType | "examples" | "old_patterns" | "full_source">;
  ttl_seconds?: number;
};

export type SkillDisclosureFragmentRef = {
  fragment_id: string;
  skill_id: string;
  fragment_type: SkillDisclosureFragmentType;
  content_hash: string;
};

export type SkillDisclosureManifest = {
  token_id: string;
  manifest_id: string;
  lease_id: string;
  skill_ids: string[];
  fragment_refs: SkillDisclosureFragmentRef[];
  expires_at: string;
  retention_policy: "session_only_no_persist";
};

export type SkillDisclosureSuccess = {
  ok: true;
  replayed: boolean;
  manifest: SkillDisclosureManifest;
};

export type SkillDisclosureResult = SkillDisclosureSuccess | LinkSkillsOperationFailure;

const DEFAULT_FRAGMENT_TYPES: SkillDisclosureFragmentType[] = [
  "decision_tree",
  "phase_instructions",
  "contracts",
];
const DENIED_FRAGMENT_TYPES = new Set(["examples", "old_patterns", "full_source"]);

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

function isCorpusRequest(skillId: string): boolean {
  return skillId === "*" || skillId === "skill.*" || skillId === "skill.full_corpus" || skillId.endsWith(".full_corpus");
}

function normalizeFragmentTypes(
  requested?: SkillDisclosureRequest["requested_fragment_types"],
): SkillDisclosureFragmentType[] {
  if (!requested || requested.length === 0) {
    return DEFAULT_FRAGMENT_TYPES;
  }

  if (requested.some((fragmentType) => DENIED_FRAGMENT_TYPES.has(fragmentType))) {
    throw new Error("Skill disclosure cannot include examples, old patterns, or full_source fragments");
  }

  return [...new Set(requested)] as SkillDisclosureFragmentType[];
}

function buildDisclosureManifest(params: {
  lease_id: string;
  idempotency_key: string;
  skill_ids: string[];
  fragment_types: SkillDisclosureFragmentType[];
  ttl_seconds?: number;
}): SkillDisclosureManifest {
  const ttlSeconds = Math.max(60, Math.min(params.ttl_seconds ?? 900, 1800));
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const fragmentRefs = params.skill_ids.flatMap((skillId) =>
    params.fragment_types.map((fragmentType) => ({
      fragment_id: `${params.idempotency_key}:${skillId}:${fragmentType}`,
      skill_id: skillId,
      fragment_type: fragmentType,
      content_hash: `sha256:${Buffer.from(`${skillId}:${fragmentType}`).toString("hex").slice(0, 32)}`,
    })),
  );

  return {
    token_id: `disclosure-token:${params.idempotency_key}`,
    manifest_id: `disclosure-manifest:${params.idempotency_key}`,
    lease_id: params.lease_id,
    skill_ids: params.skill_ids,
    fragment_refs: fragmentRefs,
    expires_at: expiresAt,
    retention_policy: "session_only_no_persist",
  };
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
  const disclosureReplayCache = new Map<string, SkillDisclosureSuccess>();

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

  function discloseSkills(request: SkillDisclosureRequest): SkillDisclosureResult {
    if (!request.lease_id) {
      return toFailure("LEASE_REQUEST_INVALID", "Missing lease_id for skill disclosure");
    }

    if (request.requested_skill_ids.length === 0) {
      return toFailure("LEASE_REQUEST_INVALID", "Skill disclosure requires at least one skill");
    }

    if (request.requested_skill_ids.some(isCorpusRequest)) {
      return toFailure("LEASE_DENIED", "Full skill corpus disclosure is not permitted for bot workers");
    }

    const leaseOps = leaseMap.get(request.lease_id);
    if (!leaseOps) {
      return toFailure("LEASE_DENIED", `Unknown or inactive lease for skill disclosure: ${request.lease_id}`);
    }

    for (const skillId of request.requested_skill_ids) {
      if (!allowedOperations.has(skillId)) {
        return toFailure("LEASE_DENIED", `Skill not approved by governance policy: ${skillId}`);
      }
      if (!leaseOps.has(skillId)) {
        return toFailure("LEASE_DENIED", `Lease does not grant skill: ${skillId}`);
      }
    }

    let fragmentTypes: SkillDisclosureFragmentType[];
    try {
      fragmentTypes = normalizeFragmentTypes(request.requested_fragment_types);
    } catch (error) {
      return toFailure(
        "LEASE_DENIED",
        error instanceof Error ? error.message : "Skill disclosure fragment request denied",
      );
    }

    const prior = disclosureReplayCache.get(request.idempotency_key);
    if (prior) {
      if (prior.manifest.lease_id !== request.lease_id) {
        return toFailure(
          "LEASE_IDEMPOTENCY_CONFLICT",
          `Idempotency key already used for disclosure on lease ${prior.manifest.lease_id}`,
        );
      }
      return { ...prior, replayed: true };
    }

    const success: SkillDisclosureSuccess = {
      ok: true,
      replayed: false,
      manifest: buildDisclosureManifest({
        lease_id: request.lease_id,
        idempotency_key: request.idempotency_key,
        skill_ids: request.requested_skill_ids,
        fragment_types: fragmentTypes,
        ttl_seconds: request.ttl_seconds,
      }),
    };
    disclosureReplayCache.set(request.idempotency_key, success);
    return success;
  }

  return {
    execute,
    discloseSkills,
    allowed_operation_ids: [...allowedOperations].sort(),
  };
}
