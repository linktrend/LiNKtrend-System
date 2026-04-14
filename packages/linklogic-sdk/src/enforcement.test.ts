import { describe, expect, it } from "vitest";

import { assertResolvedApprovedSkill } from "./enforcement.js";

describe("assertResolvedApprovedSkill", () => {
  it("passes for approved skill", () => {
    const skill = {
      id: "1",
      name: "bootstrap",
      version: 1,
      status: "approved" as const,
      body_markdown: "x",
      metadata: {},
      created_at: "",
      updated_at: "",
    };
    expect(() => assertResolvedApprovedSkill("bootstrap", skill)).not.toThrow();
  });

  it("throws when missing", () => {
    expect(() => assertResolvedApprovedSkill("missing", null)).toThrow(/no approved skill/);
  });
});
