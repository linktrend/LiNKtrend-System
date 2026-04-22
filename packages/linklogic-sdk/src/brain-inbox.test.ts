import { describe, expect, it } from "vitest";

import { summarizeBrainInboxTextDiff } from "./brain-inbox-diff.js";

describe("summarizeBrainInboxTextDiff", () => {
  it("detects no change", () => {
    expect(summarizeBrainInboxTextDiff("x", "x").summary).toBe("No text changes.");
  });
});
