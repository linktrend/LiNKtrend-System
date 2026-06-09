import { describe, expect, it } from "vitest";

import { canCreateProject, canSeeNavSection, isAdminProjectsSurface } from "@/lib/app-roles";

describe("admin projects gating (Wave 5A)", () => {
  it("exposes projects nav on licensor surfaces", () => {
    expect(canSeeNavSection("licensor", "admin", "projects")).toBe(true);
    expect(canSeeNavSection("licensor", "user", "projects")).toBe(true);
  });

  it("blocks licensee project CRUD on licensor actors", () => {
    expect(canCreateProject("licensor", "super_admin")).toBe(false);
    expect(canCreateProject("licensor", "admin")).toBe(false);
    expect(canCreateProject("licensee", "admin")).toBe(true);
  });

  it("identifies admin projects surface", () => {
    expect(isAdminProjectsSurface("licensor")).toBe(true);
    expect(isAdminProjectsSurface("licensee")).toBe(false);
  });
});
