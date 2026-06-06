import { describe, expect, it } from "vitest";

import { buildLinktrendClientFleet } from "./client-tenant-linktrend";

describe("client-tenant-linktrend", () => {
  it("stays within fleet v1 OpenClaw cap", () => {
    const { bindings } = buildLinktrendClientFleet();
    const agents = new Set(bindings.map((b) => b.openclawAgentId));
    expect(agents.size).toBeLessThanOrEqual(5);
    expect(agents.has("ceo-client")).toBe(true);
    expect(agents.has("linksites-head")).toBe(true);
    expect(agents.has("linkdeveloper-orchestrator")).toBe(true);
  });
});
