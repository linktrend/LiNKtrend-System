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

describe("plane adapter", () => {
  it("defaults to stub mode when LINKSKILLS_PLANE_MODE is unset", () => {
    const mode = resolvePlaneMode(baseEnv());
    expect(mode).toBe("stub");
  });

  it("returns live adapter that calls Plane API in live mode", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url, init) => {
        const path = String(url);
        const method = init?.method ?? "GET";
        if (method === "GET" && path.includes("/workspaces/linktrend")) {
          return { ok: true, status: 200, text: async () => "{}" } as Response;
        }
        if (method === "POST" && path.includes("/api/v1/") && path.endsWith("/projects/")) {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ id: "plane-proj-1", identifier: "DEMO1234" }),
          } as Response;
        }
        if (method === "POST" && path.includes("/modules/")) {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ id: "plane-mod-1" }),
          } as Response;
        }
        if (method === "POST" && path.includes("/issues/") && !path.includes("/modules/")) {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ id: `plane-issue-${Math.random()}` }),
          } as Response;
        }
        if (method === "POST" && path.includes("/cycles/")) {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ id: "plane-cycle-1" }),
          } as Response;
        }
        return { ok: true, status: 200, text: async () => "{}" } as Response;
      });

    const adapter = createPlaneAdapter(
      baseEnv({
        LINKSKILLS_PLANE_MODE: "live",
        PLANE_API_BASE_URL: "https://plane.example.com",
        PLANE_WORKSPACE_SLUG: "linktrend",
        PLANE_API_KEY: "secret",
      }),
    );

    const result = await adapter.provisionProjectAndWorkItem({
      tenant_id: "tenant-1",
      lead_id: "lead-1",
      project_name: "Calusa LinkSites",
      work_item_title: "Initial work item",
    });

    expect(result.project_id).toBe("plane-proj-1");
    expect(result.task_id).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("/projects/"))).toBe(true);
  });

  it("runs read-only readiness checks in shadow_readiness mode", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, status: 200, text: async () => "{}" } as Response);

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
    expect(fetchMock).toHaveBeenCalled();

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
});
