import { describe, expect, it } from "vitest";

import {
  planeLiveStateFromRemote,
  resolveEffectiveProjectStatus,
} from "./plane-project-status";

describe("plane project status", () => {
  it("keeps draft when Plane is unmapped", () => {
    expect(resolveEffectiveProjectStatus("draft", "unmapped")).toBe("draft");
  });

  it("maps archived Plane state to archived lifecycle", () => {
    expect(resolveEffectiveProjectStatus("running", "archived")).toBe("archived");
    expect(resolveEffectiveProjectStatus("assigned", "archived")).toBe("archived");
  });

  it("preserves active DB status when Plane project is live", () => {
    expect(resolveEffectiveProjectStatus("running", "active")).toBe("running");
    expect(resolveEffectiveProjectStatus("assigned", "active")).toBe("assigned");
  });

  it("infers archived when mapping exists but GET misses", () => {
    expect(planeLiveStateFromRemote(false, true)).toBe("archived");
    expect(planeLiveStateFromRemote(true, true)).toBe("active");
    expect(planeLiveStateFromRemote(false, false)).toBe("unmapped");
  });
});
