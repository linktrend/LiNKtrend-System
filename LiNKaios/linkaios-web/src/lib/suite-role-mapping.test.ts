import { describe, expect, it } from "vitest";

import {
  openClawAgentForRole,
  SUITE_ROLE_TO_OPENCLAW_AGENT,
  SUITE_ROLE_TO_LINKBOT_ROLE,
} from "./suite-role-mapping";

describe("suite-role-mapping", () => {
  it("maps all four suite roles to OpenClaw agents", () => {
    expect(Object.keys(SUITE_ROLE_TO_OPENCLAW_AGENT)).toEqual([
      "lead_scout",
      "website_builder",
      "outreach",
      "librarian",
    ]);
  });

  it("resolves librarian_bot to librarian agent", () => {
    expect(openClawAgentForRole(SUITE_ROLE_TO_LINKBOT_ROLE.librarian)).toBe("librarian");
  });
});
