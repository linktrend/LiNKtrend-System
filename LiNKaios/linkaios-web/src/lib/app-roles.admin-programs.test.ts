import { describe, expect, it } from "vitest";

import { canCreateProject, canSeeNavSection, isAdminProgramsSurface } from "@/lib/app-roles";

describe("admin projects gating (Wave 1B)", () => {
  it("exposes projects nav on licensor surfaces for admin projects stub", () => {
    expect(canSeeNavSection("licensor", "admin", "projects")).toBe(true);
    expect(canSeeNavSection("licensor", "user", "projects")).toBe(true);
  });

  it("blocks licensee project CRUD on licensor actors", () => {
    expect(canCreateProject("licensor", "super_admin")).toBe(false);
    expect(canCreateProject("licensor", "admin")).toBe(false);
    expect(canCreateProject("licensee", "admin")).toBe(true);
  });

  it("identifies admin projects surface", () => {
    expect(isAdminProgramsSurface("licensor")).toBe(true);
    expect(isAdminProgramsSurface("licensee")).toBe(false);
  });
});
