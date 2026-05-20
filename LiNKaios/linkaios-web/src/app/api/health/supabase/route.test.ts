import { afterEach, describe, expect, it, vi } from "vitest";

const getSupabaseAdminMock = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

describe("GET /api/health/supabase", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns dev_stub_ready when Supabase throws in non-production dev-stub mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LINKAIOS_SUPABASE_HEALTH_DEV_STUB", "true");

    getSupabaseAdminMock.mockReturnValue({
      schema: () => ({
        from: () => ({
          select: async () => {
            throw new Error("fetch failed");
          },
        }),
      }),
    });

    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.mode).toBe("dev_stub_ready");
  });

  it("fails closed in production when Supabase throws", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LINKAIOS_SUPABASE_HEALTH_DEV_STUB", "true");

    getSupabaseAdminMock.mockReturnValue({
      schema: () => ({
        from: () => ({
          select: async () => {
            throw new Error("fetch failed");
          },
        }),
      }),
    });

    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.mode).toBeUndefined();
  });
});
