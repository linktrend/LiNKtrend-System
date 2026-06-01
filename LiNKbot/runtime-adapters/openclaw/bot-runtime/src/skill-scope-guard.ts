/**
 * LiNKbot worker skill scope guard — enforces LTS-011 IP boundary at runtime.
 */

export type WorkerSkillScope = {
  allowed_skill_ids: string[];
  lease_id: string;
};

export type WorkerRuntimeSkillState = {
  worker_id: string;
  loaded_skill_ids: string[];
  active_lease_id: string | null;
};

export function enforceSkillIpBoundary(
  state: WorkerRuntimeSkillState,
  scope: WorkerSkillScope,
  requestedSkillId: string,
): { allowed: boolean; reason?: string } {
  if (scope.lease_id !== state.active_lease_id) {
    return { allowed: false, reason: "Lease mismatch — reload skills for active lease" };
  }
  if (!scope.allowed_skill_ids.includes(requestedSkillId)) {
    return { allowed: false, reason: `Skill ${requestedSkillId} outside lease scope` };
  }
  return { allowed: true };
}

export function purgeSkillsBeyondLease(
  state: WorkerRuntimeSkillState,
  scope: WorkerSkillScope,
): WorkerRuntimeSkillState {
  const allowed = new Set(scope.allowed_skill_ids);
  return {
    ...state,
    active_lease_id: scope.lease_id,
    loaded_skill_ids: state.loaded_skill_ids.filter((id) => allowed.has(id)),
  };
}
