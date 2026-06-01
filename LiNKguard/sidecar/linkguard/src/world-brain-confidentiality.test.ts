import { describe, expect, it } from "vitest";

import { evaluateWorldBrainContribution } from "./world-brain-confidentiality.js";

describe("world brain confidentiality (LTS-050)", () => {
  it("blocks contributions containing forbidden contact fields", () => {
    const result = evaluateWorldBrainContribution({
      pattern: "linksites_lesson",
      contact_email: "lead@example.com",
      summary: "Outreach timing lesson",
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.blocked_keys.length).toBeGreaterThan(0);
    }
  });

  it("anonymizes safe payloads for world brain write", () => {
    const result = evaluateWorldBrainContribution({
      pattern: "linksites_lesson",
      summary: "Template selection heuristic for tenant-abc123 runs",
      stage_id: "linksites.template_selection",
    });

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.proof.policy).toBe("linkguard.world_brain.v1");
      expect(JSON.stringify(result.anonymized)).not.toContain("tenant-abc123");
    }
  });
});
