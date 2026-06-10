import { describe, expect, it, vi } from "vitest";

import {
  getPlaneBridgeConfig,
  planeProjectBoardHref,
  planeWorkspaceProjectsHref,
} from "@/lib/plane-links";

describe("plane-links", () => {
  it("builds workspace and project URLs with slug", () => {
    vi.stubEnv("NEXT_PUBLIC_PLANE_URL", "https://plane.linktrend.internal");
    vi.stubEnv("NEXT_PUBLIC_PLANE_WORKSPACE_SLUG", "linkprojects");

    const cfg = getPlaneBridgeConfig();
    expect(planeWorkspaceProjectsHref(cfg)).toBe("https://plane.linktrend.internal/linkprojects/projects/");
    expect(planeProjectBoardHref(cfg, "ADMINPLAAC38")).toBe(
      "https://plane.linktrend.internal/linkprojects/projects/ADMINPLAAC38/",
    );
  });

  it("falls back to server workspace slug when public slug is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_PLANE_URL", "https://plane.linktrend.internal");
    vi.stubEnv("NEXT_PUBLIC_PLANE_WORKSPACE_SLUG", "");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "linkprojects");

    const cfg = getPlaneBridgeConfig();
    expect(cfg.workspaceSlug).toBe("linkprojects");
    expect(planeProjectBoardHref(cfg, "ADMINPLAAC38")).toBe(
      "https://plane.linktrend.internal/linkprojects/projects/ADMINPLAAC38/",
    );
  });
});
