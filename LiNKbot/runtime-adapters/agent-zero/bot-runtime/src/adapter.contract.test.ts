import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAgentZeroAdapter } from "./adapter.js";
import { resetAgentZeroSessionsForTests } from "./session.js";
import type { AgentZeroMissionRequest } from "./types.js";

const { persistAgentZeroLinkguardCleanup } = vi.hoisted(() => ({
  persistAgentZeroLinkguardCleanup: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./linkguard-cleanup.js", () => ({
  persistAgentZeroLinkguardCleanup,
}));

vi.mock("@linktrend/linklogic-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@linktrend/linklogic-sdk")>();
  return {
    ...actual,
    writeBrainAuditEvent: vi.fn().mockResolvedValue({}),
    recordTrace: vi.fn().mockResolvedValue(undefined),
  };
});

const baseRequest: AgentZeroMissionRequest = {
  tenant_id: "tenant-1",
  run_id: "00000000-0000-4000-8000-000000000001",
  stage_id: "stage-research",
  role_id: "research_enrichment_bot",
  lane_id: "az-linksites-research",
  inputs: { lead_input: { business_name: "Acme" } },
  correlation_id: "corr-1",
};

describe("AgentZeroRuntimeAdapter contract (Wave 2.2)", () => {
  beforeEach(() => {
    resetAgentZeroSessionsForTests();
    process.env.AGENT_ZERO_STUB_MODE = "1";
    process.env.NODE_ENV = "test";
  });

  it("implements session → mission → lease → event → terminate lifecycle", async () => {
    const env = {} as import("@linktrend/shared-config").Env;
    const adapter = createAgentZeroAdapter(env);

    const session = adapter.openSession(baseRequest);
    expect(session.session_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(session.lane_id).toBe("az-linksites-research");

    const leaseId = await adapter.requestLease(session, "cap.agent_zero.lane_execution", {
      lane_id: session.lane_id,
    });
    expect(leaseId).toMatch(/^lease-az-mock-/);

    const eventId = await adapter.emitEvent(session, "role.started", { probe: true });
    expect(eventId).toBeTruthy();

    const result = await adapter.assignMission(session, baseRequest);
    expect(result.outputs).toMatchObject({ stub: true, lane_id: "az-linksites-research" });
    expect(result.model_run_id).toBeTruthy();
    expect(result.lease_ids.length).toBeGreaterThan(0);
    expect(result.audit_event_ids.length).toBeGreaterThan(0);

    await adapter.terminate(session, "test_complete");

    expect(persistAgentZeroLinkguardCleanup).toHaveBeenCalled();
    const cleanupCall = persistAgentZeroLinkguardCleanup.mock.calls.at(-1)?.[1];
    expect(cleanupCall).toMatchObject({
      lane_id: "az-linksites-research",
      role_id: "research_enrichment_bot",
      tenant_id: "tenant-1",
    });
  });
});
