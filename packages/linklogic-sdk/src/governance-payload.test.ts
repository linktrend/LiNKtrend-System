import { describe, expect, it } from "vitest";

import { toolNamesFromManifestPayload, wrapGovernanceForOpenClaw } from "./governance-payload.js";

describe("toolNamesFromManifestPayload", () => {
  it("reads approvedTools array", () => {
    expect(toolNamesFromManifestPayload({ approvedTools: ["read", "write"] })).toEqual([
      "read",
      "write",
    ]);
  });

  it("reads tools string array", () => {
    expect(toolNamesFromManifestPayload({ tools: ["a"] })).toEqual(["a"]);
  });

  it("returns empty for invalid", () => {
    expect(toolNamesFromManifestPayload(null)).toEqual([]);
  });
});

describe("wrapGovernanceForOpenClaw", () => {
  it("nests under linktrendGovernance", () => {
    const inner = {
      bootstrap: { traceId: "t1", authorizationState: "accepted" as const },
      approvedTools: { toolNames: [] },
    };
    const wrapped = wrapGovernanceForOpenClaw(inner);
    expect(wrapped.linktrendGovernance.bootstrap.traceId).toBe("t1");
  });
});
