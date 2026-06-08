import { describe, expect, it } from "vitest";

import { canSeePlatformSettingsTab } from "@/lib/app-roles";

describe("canSeePlatformSettingsTab", () => {
  it("allows licensor Admin and Super Admin", () => {
    expect(canSeePlatformSettingsTab("licensor", "admin")).toBe(true);
    expect(canSeePlatformSettingsTab("licensor", "super_admin")).toBe(true);
  });

  it("denies licensor User and all licensee roles", () => {
    expect(canSeePlatformSettingsTab("licensor", "user")).toBe(false);
    expect(canSeePlatformSettingsTab("licensee", "super_admin")).toBe(false);
    expect(canSeePlatformSettingsTab("licensee", "admin")).toBe(false);
    expect(canSeePlatformSettingsTab("licensee", "user")).toBe(false);
  });
});
