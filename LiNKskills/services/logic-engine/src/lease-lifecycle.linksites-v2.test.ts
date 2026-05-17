import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";
import type { LeaseRequest } from "@linktrend/linklogic-sdk";
import { requestLease } from "./lease-lifecycle.js";

vi.mock("./safety.js", () => ({
  checkKillSwitch: vi.fn(),
}));

vi.mock("./capability-catalog.js", () => ({
  capabilityExists: vi.fn(),
  getCapabilityPolicy: vi.fn(),
  isWriteCapableLinksitesV2Capability: vi.fn(),
}));

vi.mock("./audit-events.js", () => ({
  emitLeaseRequested: vi.fn(),
  emitLeaseGranted: vi.fn(),
  emitLeaseDenied: vi.fn(),
  emitLeaseExecuted: vi.fn(),
  emitCapabilityOutput: vi.fn(),
}));

import { checkKillSwitch } from "./safety.js";
import {
  capabilityExists,
  getCapabilityPolicy,
  isWriteCapableLinksitesV2Capability,
} from "./capability-catalog.js";

const mockEnv = {} as Env;

function createMockClient(rpcImpl: (fn: string) => unknown): SupabaseClient {
  return {
    schema: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockImplementation((fn: string) => ({
      data: rpcImpl(fn),
      error: null,
    })),
  } as unknown as SupabaseClient;
}

function baseRequest(overrides?: Partial<LeaseRequest>): LeaseRequest {
  return {
    tenant_id: "11111111-1111-1111-1111-111111111111",
    run_id: "22222222-2222-2222-2222-222222222222",
    stage_id: "stage-1",
    capability: "cap.research.public_web",
    arguments: { mode: "shadow", query: "test" },
    idempotency_key: "idem-1",
    actor: { actor_kind: "plugin", actor_id: "linksites" },
    ...overrides,
  };
}

describe("LinkSites v2 lease request behavior", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("requests a new lease in safe mode and returns requires_approval", async () => {
    vi.mocked(capabilityExists).mockResolvedValue(true);
    vi.mocked(checkKillSwitch).mockResolvedValue({ state: "open", level: 1, reason: null });
    vi.mocked(getCapabilityPolicy).mockResolvedValue("require_approval");
    vi.mocked(isWriteCapableLinksitesV2Capability).mockReturnValue(false);

    const client = createMockClient((fn) => {
      if (fn === "request_lease") {
        return [{ lease_id: "lease-1", status: "requested", is_existing: false, kill_switch_state: "open" }];
      }
      if (fn === "grant_lease") return true;
      return null;
    });

    const result = await requestLease(client, mockEnv, baseRequest());
    expect(result.status).toBe("requires_approval");
    expect(result.lease_id).toBe("lease-1");
    expect(result.kill_switch_state).toBe("open");
  });

  it("denies lease when kill switch is tripped", async () => {
    vi.mocked(capabilityExists).mockResolvedValue(true);
    vi.mocked(checkKillSwitch).mockResolvedValue({ state: "tripped", level: 1, reason: "capability tripped" });
    vi.mocked(isWriteCapableLinksitesV2Capability).mockReturnValue(false);

    const client = createMockClient((fn) => {
      if (fn === "request_lease") {
        return [{ lease_id: "lease-2", status: "denied", is_existing: false, kill_switch_state: "tripped" }];
      }
      return null;
    });

    const result = await requestLease(client, mockEnv, baseRequest());
    expect(result.status).toBe("denied");
    expect(result.failure?.code).toBe("LEASE_KILL_SWITCH");
  });

  it("returns existing lease for idempotent replay", async () => {
    vi.mocked(capabilityExists).mockResolvedValue(true);
    vi.mocked(checkKillSwitch).mockResolvedValue({ state: "open", level: 1, reason: null });
    vi.mocked(isWriteCapableLinksitesV2Capability).mockReturnValue(false);

    const client = createMockClient((fn) => {
      if (fn === "request_lease") {
        return [{ lease_id: "lease-3", status: "granted", is_existing: true, kill_switch_state: "open" }];
      }
      return null;
    });

    const result = await requestLease(client, mockEnv, baseRequest({ idempotency_key: "same-idem-key" }));
    expect(result.is_existing).toBe(true);
    expect(result.lease_id).toBe("lease-3");
    expect(result.status).toBe("granted");
  });

  it("refuses live mode for write-capable LinkSites capability by default", async () => {
    vi.mocked(capabilityExists).mockResolvedValue(true);
    vi.mocked(isWriteCapableLinksitesV2Capability).mockReturnValue(true);

    const client = createMockClient(() => {
      throw new Error("RPC should not be called when live mode is denied");
    });

    const result = await requestLease(
      client,
      mockEnv,
      baseRequest({
        capability: "cap.supabase.mirror_content",
        arguments: { mode: "live", site_id: "site-1", site_generation_run_id: "run-1" },
      }),
    );

    expect(result.status).toBe("denied");
    expect(result.failure?.code).toBe("LEASE_DENIED");
    expect(result.failure?.message).toContain("Live mode is disabled by default");
  });
});
