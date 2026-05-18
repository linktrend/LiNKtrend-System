import { afterEach, describe, expect, it, vi } from "vitest";

import { createPlaneAdapter, resolvePlaneMode } from "./plane-adapter";
import type { Env } from "@linktrend/shared-config";

function baseEnv(overrides: Partial<Env> = {}): Env {
  return {
    ...overrides,
  } as Env;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("plane adapter scaffold", () => {
  it("defaults to stub mode when LINKSKILLS_PLANE_MODE is unset", () => {
    const mode = resolvePlaneMode(baseEnv());
    expect(mode).toBe("stub");
  });

  it("returns stub adapter in live mode scaffold to prevent remote writes", async () => {
    const adapter = createPlaneAdapter(baseEnv({ LINKSKILLS_PLANE_MODE: "live" }));
    const result = await adapter.provisionProjectAndWorkItem({
      tenant_id: "tenant-1",
      lead_id: "lead-1",
      project_name: "Project A",
      work_item_title: "Initial work item",
    });

    expect(result.project_id).toMatch(/^proj-/);
    expect(result.task_id).toMatch(/^task-/);
  });

  it("runs read-only readiness checks in shadow_readiness mode", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, status: 200 } as Response);

    const adapter = createPlaneAdapter(
      baseEnv({
        LINKSKILLS_PLANE_MODE: "shadow_readiness",
        PLANE_API_BASE_URL: "https://plane.example.com",
        PLANE_WORKSPACE_SLUG: "workspace-a",
        PLANE_API_KEY: "secret",
      }),
    );

    const result = await adapter.provisionProjectAndWorkItem({
      tenant_id: "tenant-1",
      lead_id: "lead-1",
      project_name: "Project A",
      work_item_title: "Initial work item",
    });

    expect(result.project_id).toMatch(/^plane-shadow-project-/);
    expect(result.task_id).toMatch(/^plane-shadow-task-/);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls).toContain("https://plane.example.com/api/workspaces/workspace-a");
    expect(urls).toContain("https://plane.example.com/api/workspaces/workspace-a/projects/");

    for (const [, options] of fetchMock.mock.calls) {
      expect(options?.method).toBe("GET");
    }
  });

  it("fails with INTEGRATION_AUTH_FAILED when readiness env is missing", async () => {
    const adapter = createPlaneAdapter(baseEnv({ LINKSKILLS_PLANE_MODE: "shadow_readiness" }));

    await expect(
      adapter.provisionProjectAndWorkItem({
        tenant_id: "tenant-1",
        lead_id: "lead-1",
        project_name: "Project A",
        work_item_title: "Initial work item",
      }),
    ).rejects.toMatchObject({
      failureCode: "INTEGRATION_AUTH_FAILED",
    });
  });

  it("maps timeout failures in shadow_readiness mode", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      Object.assign(new Error("aborted"), { name: "AbortError" }),
    );

    const adapter = createPlaneAdapter(
      baseEnv({
        LINKSKILLS_PLANE_MODE: "shadow_readiness",
        PLANE_API_BASE_URL: "https://plane.example.com",
        PLANE_WORKSPACE_SLUG: "workspace-a",
        PLANE_API_KEY: "secret",
      }),
    );

    await expect(
      adapter.provisionProjectAndWorkItem({
        tenant_id: "tenant-1",
        lead_id: "lead-1",
        project_name: "Project A",
        work_item_title: "Initial work item",
      }),
    ).rejects.toMatchObject({
      failureCode: "INTEGRATION_TIMEOUT",
    });
  });
});
