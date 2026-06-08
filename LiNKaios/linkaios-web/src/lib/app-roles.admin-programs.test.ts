import { describe, expect, it } from "vitest";

import { canCreateProject, canSeeNavSection, isAdminProgramsSurface } from "@/lib/app-roles";

describe("admin programs gating (Wave 1B)", () => {
  it("exposes projects nav on licensor surfaces for admin programs stub", () => {
    expect(canSeeNavSection("licensor", "admin", "projects")).toBe(true);
    expect(canSeeNavSection("licensor", "user", "projects")).toBe(true);
  });

  it("blocks licensee project CRUD on licensor actors", () => {
    expect(canCreateProject("licensor", "super_admin")).toBe(false);
    expect(canCreateProject("licensor", "admin")).toBe(false);
    expect(canCreateProject("licensee", "admin")).toBe(true);
  });

  it("identifies admin programs surface", () => {
    expect(isAdminProgramsSurface("licensor")).toBe(true);
    expect(isAdminProgramsSurface("licensee")).toBe(false);
  });
});
