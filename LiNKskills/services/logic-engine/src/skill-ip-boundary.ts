/**
 * Progressive disclosure and skill IP boundary (LTS-011).
 * LiNKbots receive skills just-in-time; no full corpus beyond lease scope.
 * Traceability: PPD §3 progressive disclosure; LiNKguard IP.
 */

export type SkillFragmentScope = {
  allowed_skill_ids: string[];
  lease_id: string;
  run_id: string;
  step_scope: "tenant" | "capability" | "run" | "step";
};

export type WorkerSkillCache = {
  worker_id: string;
  persisted_skill_ids: string[];
  lease_id: string | null;
};

/** Skill allowed only when explicitly listed on the active lease disclosure. */
export function skillWithinLeaseScope(scope: SkillFragmentScope, skillId: string): boolean {
  return scope.allowed_skill_ids.includes(skillId);
}

/** Reject full-source fragments — IP boundary default. */
export function rejectFullSourceDisclosure(fragmentType: string): boolean {
  return fragmentType === "full_source";
}

/** Skills on worker that exceed lease scope must be purged before next task. */
export function skillsToPurgeFromWorker(cache: WorkerSkillCache, scope: SkillFragmentScope): string[] {
  const allowed = new Set(scope.allowed_skill_ids);
  return cache.persisted_skill_ids.filter((id) => !allowed.has(id));
}

export function assertWorkerSkillIpBoundary(cache: WorkerSkillCache, scope: SkillFragmentScope): {
  ok: boolean;
  violations: string[];
} {
  const violations = skillsToPurgeFromWorker(cache, scope);
  return { ok: violations.length === 0, violations };
}

export function justInTimeSkillDelivery(
  scope: SkillFragmentScope,
  requestedSkillId: string,
): { deliver: boolean; reason?: string } {
  if (!skillWithinLeaseScope(scope, requestedSkillId)) {
    return { deliver: false, reason: `Skill ${requestedSkillId} not in lease ${scope.lease_id} scope` };
  }
  return { deliver: true };
}

export function clearedWorkerCache(cache: WorkerSkillCache, scope: SkillFragmentScope): WorkerSkillCache {
  const allowed = new Set(scope.allowed_skill_ids);
  return {
    ...cache,
    lease_id: scope.lease_id,
    persisted_skill_ids: cache.persisted_skill_ids.filter((id) => allowed.has(id)),
  };
}
