import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const rpc = vi.fn();
const schema = vi.fn(() => ({ rpc }));
const from = vi.fn(() => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(),
      })),
    })),
  })),
}));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({ schema, from }),
}));

vi.mock("@/lib/admin-linkskills-tenant", () => ({
  resolveLicensorTenantId: vi.fn(async () => "licensor-tenant-id"),
}));

vi.mock("@/lib/kernel/plane-project-sync", () => ({
  isPlaneLiveConfigured: () => false,
  syncLinkaiosProjectToPlane: vi.fn(),
}));

vi.mock("@linktrend/zulip-gateway", () => ({
  zulipLiveReady: () => false,
  bootstrapProjectZulip: vi.fn(),
}));

import { createAdminProjectPersisted, parseCreateAdminProjectRequest } from "./admin-project-create";

describe("admin project create", () => {
  beforeEach(() => {
    rpc.mockReset();
    schema.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "test-secret";
    delete process.env.LINKAIOS_PROJECTS_PERSIST;
  });

  it("parses governed admin create requests", () => {
    const input = parseCreateAdminProjectRequest({
      name: "LiNKsuitegen catalogue",
      projectType: "suite_gen",
      cadence: "continuous",
    });
    expect(input.projectType).toBe("suite_gen");
    expect(input.cadence).toBe("continuous");
  });

  it("calls create_project with licensor tenant and preset modules", async () => {
    rpc.mockResolvedValueOnce({
      data: [{ project_id: "22222222-2222-4222-8222-222222222222", created_at: "2026-06-10T12:00:00.000Z" }],
      error: null,
    });

    const result = await createAdminProjectPersisted({
      name: "LiNKsuitegen catalogue",
      projectType: "suite_gen",
      cadence: "continuous",
    });

    expect(schema).toHaveBeenCalledWith("linkaios");
    expect(rpc).toHaveBeenCalledWith("create_project", {
      p_tenant_id: "licensor-tenant-id",
      p_title: "LiNKsuitegen catalogue",
      p_suite_id: "linksuitegen",
      p_module_ids: ["suite-gen-catalogue"],
      p_cadence: "continuous",
      p_actor_id: null,
    });
    expect(result.projectId).toBe("22222222-2222-4222-8222-222222222222");
  });
});
