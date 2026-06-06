import { describe, expect, it } from "vitest";

import {
  LINKDEVELOPER_OPENCLAW_ORCHESTRATOR_AGENT,
  LINKDEVELOPER_OPENCLAW_STEWARD_AGENT,
  LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT,
  openClawAgentIdForLinkdeveloperRole,
} from "./openclaw-mapping.js";

describe("linkdeveloper openclaw-mapping (Wave 1.6)", () => {
  it("maps orchestrator and steward roles only", () => {
    expect(Object.keys(LINKDEVELOPER_ROLE_TO_OPENCLAW_AGENT).sort()).toEqual([
      "product_steward_linkbot",
      "suite_orchestrator_linkbot",
    ]);
  });

  it("resolves orchestrator to linkdeveloper-orchestrator", () => {
    expect(openClawAgentIdForLinkdeveloperRole("suite_orchestrator_linkbot")).toBe(
      LINKDEVELOPER_OPENCLAW_ORCHESTRATOR_AGENT,
    );
    expect(LINKDEVELOPER_OPENCLAW_ORCHESTRATOR_AGENT).toBe("linkdeveloper-orchestrator");
  });

  it("resolves steward to linkdeveloper-steward", () => {
    expect(openClawAgentIdForLinkdeveloperRole("product_steward_linkbot")).toBe(
      LINKDEVELOPER_OPENCLAW_STEWARD_AGENT,
    );
    expect(LINKDEVELOPER_OPENCLAW_STEWARD_AGENT).toBe("linkdeveloper-steward");
  });

  it("returns null for specialist roles (Agent Zero in Wave 2)", () => {
    expect(openClawAgentIdForLinkdeveloperRole("architecture_linkbot")).toBeNull();
    expect(openClawAgentIdForLinkdeveloperRole("qa_linkbot")).toBeNull();
  });
});
