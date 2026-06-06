import { describe, expect, it } from "vitest";

import {
  LINKDEVELOPER_CLIENT_BASE,
  LINKDEVELOPER_CLIENT_ROUTES,
  LINKDEVELOPER_PROJECT_TABS,
  formatProjectTabLabel,
  linkdeveloperProjectTabActive,
} from "./routes";

describe("LiNKdeveloper Client UI routes (Wave 8.11)", () => {
  it("exposes project workspace tabs on Client surface", () => {
    expect(LINKDEVELOPER_CLIENT_BASE).toBe("/linkdeveloper");
    expect(LINKDEVELOPER_PROJECT_TABS).toEqual([
      "overview",
      "plan",
      "build",
      "validation",
      "launch",
      "activity",
    ]);
    expect(LINKDEVELOPER_CLIENT_ROUTES.project("abc", "build")).toBe(
      "/linkdeveloper/projects/abc/build",
    );
  });

  it("formats tab labels for navigation", () => {
    expect(formatProjectTabLabel("overview")).toBe("Overview");
    expect(formatProjectTabLabel("validation")).toBe("Validation");
  });

  it("detects active tab from pathname", () => {
    expect(
      linkdeveloperProjectTabActive("build", "/linkdeveloper/projects/run-1/build"),
    ).toBe(true);
    expect(
      linkdeveloperProjectTabActive("plan", "/linkdeveloper/projects/run-1/build"),
    ).toBe(false);
  });
});
