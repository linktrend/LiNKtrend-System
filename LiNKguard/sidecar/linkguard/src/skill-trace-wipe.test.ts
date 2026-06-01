import { describe, expect, it, beforeEach } from "vitest";

import {
  clearSkillTraceStores,
  listSkillTraces,
  registerSkillTrace,
  wipeSkillTracesForSession,
} from "./skill-trace-wipe.js";

describe("skill trace wipe (LTS-050)", () => {
  beforeEach(() => {
    clearSkillTraceStores();
  });

  it("wipes all skill traces for a bot session after run completes", () => {
    registerSkillTrace({
      session_id: "sess-1",
      skill_id: "skill-copywriting",
      skill_name: "Copywriting",
      step_id: "step-1",
      captured_at: "2026-06-01T00:00:00.000Z",
      trace_digest: "digest-1",
    });
    registerSkillTrace({
      session_id: "sess-1",
      skill_id: "skill-layout",
      skill_name: "Layout",
      captured_at: "2026-06-01T00:00:01.000Z",
      trace_digest: "digest-2",
    });

    expect(listSkillTraces("sess-1")).toHaveLength(2);

    const wipe = wipeSkillTracesForSession("sess-1", "2026-06-01T00:00:05.000Z");
    expect(wipe.wiped_count).toBe(2);
    expect(wipe.wiped_skill_ids).toEqual(["skill-copywriting", "skill-layout"]);
    expect(listSkillTraces("sess-1")).toHaveLength(0);
  });
});
