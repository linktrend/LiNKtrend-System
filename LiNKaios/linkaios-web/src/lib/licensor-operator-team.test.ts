import { describe, expect, it } from "vitest";

import {
  appRoleTierToUserAccessRole,
  parseInviteAppRoleTier,
  parseInviteEmail,
  parseInviteFullName,
  resolveAppRoleTierFromAccess,
} from "./licensor-operator-team-shared";

describe("licensor-operator-team helpers", () => {
  it("maps app role tiers to user_access DB roles", () => {
    expect(appRoleTierToUserAccessRole("user")).toBe("viewer");
    expect(appRoleTierToUserAccessRole("admin")).toBe("operator");
    expect(appRoleTierToUserAccessRole("super_admin")).toBe("admin");
  });

  it("resolves app role tier from metadata first", () => {
    expect(
      resolveAppRoleTierFromAccess({
        dbRole: "operator",
        metadata: { app_role_tier: "super_admin" },
      }),
    ).toBe("super_admin");
  });

  it("falls back to DB role mapping", () => {
    expect(resolveAppRoleTierFromAccess({ dbRole: "viewer", metadata: {} })).toBe("user");
    expect(resolveAppRoleTierFromAccess({ dbRole: "operator", metadata: {} })).toBe("admin");
    expect(resolveAppRoleTierFromAccess({ dbRole: "admin", metadata: {} })).toBe("admin");
  });

  it("validates invite form fields", () => {
    expect(parseInviteEmail("  Alex@LinkTrend.IO ")).toBe("alex@linktrend.io");
    expect(parseInviteEmail("not-an-email")).toBeNull();
    expect(parseInviteFullName("  Alex   Chen ")).toBe("Alex Chen");
    expect(parseInviteFullName("A")).toBeNull();
    expect(parseInviteAppRoleTier("admin")).toBe("admin");
    expect(parseInviteAppRoleTier("owner")).toBeNull();
  });
});
