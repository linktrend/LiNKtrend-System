import { describe, expect, it } from "vitest";

import {
  assertWorkerSkillIpBoundary,
  clearedWorkerCache,
  justInTimeSkillDelivery,
  rejectFullSourceDisclosure,
  skillWithinLeaseScope,
  skillsToPurgeFromWorker,
  type SkillFragmentScope,
  type WorkerSkillCache,
} from "./skill-ip-boundary.js";

const scope: SkillFragmentScope = {
  allowed_skill_ids: ["skill.lead_qualify", "skill.template_pick"],
  lease_id: "lease-42",
  run_id: "run-7",
  step_scope: "step",
};

describe("skill IP boundary (LTS-011)", () => {
  it("allows just-in-time delivery only for lease-scoped skills", () => {
    expect(skillWithinLeaseScope(scope, "skill.lead_qualify")).toBe(true);
    expect(justInTimeSkillDelivery(scope, "skill.secret_corpus").deliver).toBe(false);
  });

  it("rejects full_source disclosure fragments", () => {
    expect(rejectFullSourceDisclosure("full_source")).toBe(true);
    expect(rejectFullSourceDisclosure("decision_tree")).toBe(false);
  });

  it("acceptance: no full corpus persisted beyond lease scope", () => {
    const cache: WorkerSkillCache = {
      worker_id: "bot-1",
      lease_id: "lease-42",
      persisted_skill_ids: ["skill.lead_qualify", "skill.secret_corpus", "skill.template_pick"],
    };
    expect(skillsToPurgeFromWorker(cache, scope)).toEqual(["skill.secret_corpus"]);
    const boundary = assertWorkerSkillIpBoundary(cache, scope);
    expect(boundary.ok).toBe(false);
    const cleaned = clearedWorkerCache(cache, scope);
    expect(cleaned.persisted_skill_ids).toEqual(["skill.lead_qualify", "skill.template_pick"]);
    expect(assertWorkerSkillIpBoundary(cleaned, scope).ok).toBe(true);
  });
});
