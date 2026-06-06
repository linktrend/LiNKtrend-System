import { describe, expect, it } from "vitest";

import { LINKSUITEGEN_VISIBILITY, LinkSuitegenManifest } from "./manifest";

describe("linksuitegen suite manifest", () => {
  it("is admin_only", () => {
    expect(LINKSUITEGEN_VISIBILITY).toBe("admin_only");
    expect(LinkSuitegenManifest.suiteId).toBe("linksuitegen");
    expect(LinkSuitegenManifest.externalRepo).toContain("LiNKsuitegen");
  });
});
