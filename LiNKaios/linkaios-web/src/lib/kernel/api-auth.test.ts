import { describe, expect, it, vi } from "vitest";

import { canAccessKernelScope, resolveKernelActor } from "./api-auth";

function makeRequest(token?: string): Request {
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return new Request("http://localhost/api/kernel/test", { method: "POST", headers });
}

describe("resolveKernelActor", () => {
  it("rejects missing authorization header", async () => {
    const actor = await resolveKernelActor(
      makeRequest(),
      { getUserByAccessToken: vi.fn() },
      {}
    );
    expect(actor).toBeNull();
  });

  it("does not allow service bypass when env flag is off", async () => {
    const actor = await resolveKernelActor(
      makeRequest("svc-secret"),
      { getUserByAccessToken: vi.fn().mockResolvedValue(null) },
      { BOT_KERNEL_API_SECRET: "svc-secret", LINKAIOS_ENABLE_MVO_SERVICE_BYPASS: "false" }
    );
    expect(actor).toBeNull();
  });

  it("allows service bypass only when env flag is on and secret matches", async () => {
    const actor = await resolveKernelActor(
      makeRequest("svc-secret"),
      { getUserByAccessToken: vi.fn() },
      { BOT_KERNEL_API_SECRET: "svc-secret", LINKAIOS_ENABLE_MVO_SERVICE_BYPASS: "true" }
    );
    expect(actor).toEqual({ kind: "service", actorId: "mvo-service" });
  });

  it("rejects the historic 'Bearer undefined' bypass shape", async () => {
    const actor = await resolveKernelActor(
      makeRequest("undefined"),
      { getUserByAccessToken: vi.fn().mockResolvedValue(null) },
      { LINKAIOS_ENABLE_MVO_SERVICE_BYPASS: "true" }
    );
    expect(actor).toBeNull();
  });

  it("allows authenticated user when user kernel API is enabled", async () => {
    const actor = await resolveKernelActor(
      makeRequest("user-token"),
      { getUserByAccessToken: vi.fn().mockResolvedValue({ id: "user-1" }) },
      {}
    );
    expect(actor).toEqual({ kind: "user", actorId: "user-1" });
  });

  it("rejects authenticated users when user kernel API is explicitly disabled", async () => {
    const actor = await resolveKernelActor(
      makeRequest("user-token"),
      { getUserByAccessToken: vi.fn().mockResolvedValue({ id: "user-1" }) },
      { LINKAIOS_DISABLE_MVO_USER_KERNEL_API: "true" }
    );
    expect(actor).toBeNull();
  });

  it("enforces optional operator allowlist", async () => {
    const actor = await resolveKernelActor(
      makeRequest("user-token"),
      { getUserByAccessToken: vi.fn().mockResolvedValue({ id: "user-2" }) },
      { LINKAIOS_MVO_KERNEL_OPERATOR_USER_IDS: "user-1,user-3" }
    );
    expect(actor).toBeNull();
  });
});

describe("canAccessKernelScope", () => {
  const deps = {
    getRunScope: vi.fn(),
    getApprovalScope: vi.fn(),
    userOwnsTenantScope: vi.fn(),
  };

  it("always allows service actor", async () => {
    const allowed = await canAccessKernelScope(
      { kind: "service", actorId: "mvo-service" },
      { kind: "run", runId: "r-1" },
      deps
    );
    expect(allowed).toBe(true);
  });

  it("allows allowlisted user without scope ownership", async () => {
    const allowed = await canAccessKernelScope(
      { kind: "user", actorId: "u-1" },
      { kind: "tenant", tenantId: "t-1" },
      deps,
      { LINKAIOS_MVO_KERNEL_OPERATOR_USER_IDS: "u-1" }
    );
    expect(allowed).toBe(true);
  });

  it("denies tenant access by default when ownership cannot be proven", async () => {
    deps.userOwnsTenantScope.mockResolvedValueOnce(false);
    const allowed = await canAccessKernelScope(
      { kind: "user", actorId: "u-2" },
      { kind: "tenant", tenantId: "t-1" },
      deps,
      {}
    );
    expect(allowed).toBe(false);
  });

  it("allows run access when user requested the run", async () => {
    deps.getRunScope.mockResolvedValueOnce({
      tenantId: "t-1",
      requestedByActorId: "u-2",
    });
    const allowed = await canAccessKernelScope(
      { kind: "user", actorId: "u-2" },
      { kind: "run", runId: "r-1" },
      deps,
      {}
    );
    expect(allowed).toBe(true);
  });

  it("denies run access when user only has tenant history", async () => {
    deps.getRunScope.mockResolvedValueOnce({
      tenantId: "t-1",
      requestedByActorId: "u-owner",
    });
    deps.userOwnsTenantScope.mockResolvedValueOnce(true);
    const allowed = await canAccessKernelScope(
      { kind: "user", actorId: "u-sibling" },
      { kind: "run", runId: "r-1" },
      deps,
      {}
    );
    expect(allowed).toBe(false);
  });

  it("allows approval access when user requested the approval", async () => {
    deps.getApprovalScope.mockResolvedValueOnce({
      runId: "r-1",
      tenantId: "t-1",
      requestedByActorId: "u-3",
    });
    const allowed = await canAccessKernelScope(
      { kind: "user", actorId: "u-3" },
      { kind: "approval", approvalId: "a-1" },
      deps,
      {}
    );
    expect(allowed).toBe(true);
  });

  it("denies approval access when user only has tenant history", async () => {
    deps.getApprovalScope.mockResolvedValueOnce({
      runId: "r-1",
      tenantId: "t-1",
      requestedByActorId: "u-owner",
    });
    deps.getRunScope.mockResolvedValueOnce({
      tenantId: "t-1",
      requestedByActorId: "u-owner",
    });
    deps.userOwnsTenantScope.mockResolvedValueOnce(true);
    const allowed = await canAccessKernelScope(
      { kind: "user", actorId: "u-sibling" },
      { kind: "approval", approvalId: "a-1" },
      deps,
      {}
    );
    expect(allowed).toBe(false);
  });
});
