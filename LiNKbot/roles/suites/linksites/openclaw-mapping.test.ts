import { describe, expect, it } from "vitest";

import { LINKSITES_OPENCLAW_HEAD_AGENT, LINKSITES_ROLE_TO_OPENCLAW_AGENT } from "./openclaw-mapping.js";
import { LINKSITES_ROLES } from "./roles.js";

describe("linksites openclaw-mapping (Wave 1.5)", () => {
  it("maps every declared LinkSites role to linksites-head", () => {
    const roleIds = Object.keys(LINKSITES_ROLES);
    expect(roleIds.length).toBeGreaterThan(0);
    for (const roleId of roleIds) {
      expect(LINKSITES_ROLE_TO_OPENCLAW_AGENT[roleId as keyof typeof LINKSITES_ROLE_TO_OPENCLAW_AGENT]).toBe(
        LINKSITES_OPENCLAW_HEAD_AGENT,
      );
    }
  });

  it("uses fleet v1 linksites-head agent id", () => {
    expect(LINKSITES_OPENCLAW_HEAD_AGENT).toBe("linksites-head");
  });
});
