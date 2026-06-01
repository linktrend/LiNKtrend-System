import { describe, expect, it } from "vitest";

import { enforceSkillIpBoundary, purgeSkillsBeyondLease } from "./skill-scope-guard.js";

describe("skill scope guard (LTS-011)", () => {
  const scope = { lease_id: "lease-1", allowed_skill_ids: ["skill.a", "skill.b"] };

  it("denies skills outside active lease", () => {
    const state = { worker_id: "w1", loaded_skill_ids: ["skill.a"], active_lease_id: "lease-1" };
    expect(enforceSkillIpBoundary(state, scope, "skill.secret").allowed).toBe(false);
    expect(enforceSkillIpBoundary(state, scope, "skill.a").allowed).toBe(true);
  });

  it("purges loaded skills beyond lease on session cleanup", () => {
    const state = {
      worker_id: "w1",
      loaded_skill_ids: ["skill.a", "skill.secret"],
      active_lease_id: "lease-old",
    };
    const cleaned = purgeSkillsBeyondLease(state, scope);
    expect(cleaned.loaded_skill_ids).toEqual(["skill.a"]);
    expect(cleaned.active_lease_id).toBe("lease-1");
  });
});
