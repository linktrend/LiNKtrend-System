import { describe, expect, it, beforeEach } from "vitest";

import {
  cleanupBotSessionWithLinkguard,
  recordBotSkillTrace,
} from "./linkguard-cleanup.js";
import { cleanupBotSession, createBotSession } from "./session.js";

describe("LiNKguard bot session cleanup (LTS-050)", () => {
  beforeEach(() => {
    process.env.LINKGUARD_SKILL_TRACE_WIPE = "1";
  });

  it("wipes skill traces when bot session cleanup runs", () => {
    const session = createBotSession(
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "linksites.build",
      "website_builder_bot",
      "website_package",
      {},
      "fast",
    );

    recordBotSkillTrace({
      session_id: session.session_id,
      skill_id: "skill-template-fill",
      skill_name: "Template Fill",
      captured_at: new Date().toISOString(),
      trace_digest: "abc",
    });

    const guardResult = cleanupBotSessionWithLinkguard(session.session_id);
    expect(guardResult.skill_traces_wiped).toBe(1);

    const cleaned = cleanupBotSession(session.session_id);
    expect(cleaned).toBe(true);
  });
});
