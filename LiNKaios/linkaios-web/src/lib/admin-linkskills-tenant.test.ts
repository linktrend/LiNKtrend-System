import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const rpcMock = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({
    schema: () => ({
      rpc: rpcMock,
    }),
  }),
}));

describe("admin-linkskills-tenant", () => {
  beforeEach(() => {
    vi.resetModules();
    rpcMock.mockReset();
    delete process.env.LICENSOR_TENANT_ID;
    delete process.env.CALUSA_TENANT_ID;
    delete process.env.MVO_E2E_TENANT_ID;
    delete process.env.MVO_TENANT_SLUG;
  });

  it("resolveLicensorTenantId returns LICENSOR_TENANT_ID without RPC", async () => {
    process.env.LICENSOR_TENANT_ID = "licensor-uuid";
    const { resolveLicensorTenantId } = await import("./admin-linkskills-tenant");
    await expect(resolveLicensorTenantId()).resolves.toBe("licensor-uuid");
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("resolveLicensorTenantId seeds linktrend slug and never throws on RPC failure", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    const { resolveLicensorTenantId, LICENSOR_TENANT_SLUG } = await import("./admin-linkskills-tenant");
    await expect(resolveLicensorTenantId()).resolves.toBeNull();
    expect(rpcMock).toHaveBeenCalledWith("seed_demo_tenant", {
      p_slug: LICENSOR_TENANT_SLUG,
      p_display_name: "LiNKtrend",
    });
  });

  it("resolveLeasePanelTenantId uses demo slug on licensee surface", async () => {
    rpcMock.mockResolvedValue({ data: [{ tenant_id: "demo-uuid" }], error: null });
    const { resolveLeasePanelTenantId } = await import("./admin-linkskills-tenant");
    await expect(resolveLeasePanelTenantId("licensee")).resolves.toBe("demo-uuid");
    expect(rpcMock).toHaveBeenCalledWith("seed_demo_tenant", {
      p_slug: "demo",
      p_display_name: "Demo Tenant",
    });
  });
});
