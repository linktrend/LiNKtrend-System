import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const rpc = vi.fn();
const schema = vi.fn(() => ({ rpc }));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({ schema }),
}));

import { createProjectPersisted } from "./create-project-persistence";

describe("createProjectPersisted", () => {
  beforeEach(() => {
    rpc.mockReset();
    schema.mockClear();
    process.env.MVO_E2E_TENANT_ID = "e976eb75-1aff-4ca1-ad0d-5c940c343434";
  });

  it("calls linkaios.create_project RPC", async () => {
    rpc.mockResolvedValueOnce({
      data: [{ project_id: "11111111-1111-4111-8111-111111111111", created_at: "2026-06-01T12:00:00.000Z" }],
      error: null,
    });

    const result = await createProjectPersisted({
      name: "Acme site",
      suiteId: "linksites",
      moduleIds: ["website-factory"],
      cadence: "once",
    });

    expect(schema).toHaveBeenCalledWith("linkaios");
    expect(rpc).toHaveBeenCalledWith("create_project", {
      p_tenant_id: "e976eb75-1aff-4ca1-ad0d-5c940c343434",
      p_title: "Acme site",
      p_suite_id: "linksites",
      p_module_ids: ["website-factory"],
      p_cadence: "once",
      p_actor_id: null,
    });
    expect(result.projectId).toBe("11111111-1111-4111-8111-111111111111");
    expect(result.planeBootstrap).toBe("pending");
  });
});
