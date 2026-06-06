import { describe, expect, it } from "vitest";

import { ALL_SUITE_ISSUE_TEMPLATES } from "./issue-templates";
import { isRuntimeTier, RUNTIME_TIERS, validateIssueTemplateRuntimeTiers } from "./runtime-tier";

describe("runtime-tier validation (Wave 5.4)", () => {
  it("declares six runtime tiers", () => {
    expect(RUNTIME_TIERS).toEqual([
      "automation",
      "agent_zero",
      "openclaw_head",
      "openclaw_subagent",
      "codex_lane",
      "council",
    ]);
  });

  it("validates all suite issue templates", () => {
    for (const [suiteId, templates] of Object.entries(ALL_SUITE_ISSUE_TEMPLATES)) {
      const issues = validateIssueTemplateRuntimeTiers(suiteId, templates);
      expect(issues, JSON.stringify(issues)).toEqual([]);
      for (const t of templates) {
        expect(isRuntimeTier(t.runtimeTier)).toBe(true);
      }
    }
  });
});
