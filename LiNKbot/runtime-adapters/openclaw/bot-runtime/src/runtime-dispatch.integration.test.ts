import { beforeEach, describe, expect, it, vi } from "vitest";

import { dispatchRoleRuntime, resolveRoleRuntime } from "./runtime-dispatch.js";

vi.mock("@linktrend/agent-zero-runtime", () => ({
  dispatchAgentZeroMission: vi.fn().mockResolvedValue({
    session_id: "sess-az-1",
    lane_id: "az-linksites-research",
    outputs: { lead_research_bundle: { market_context: "stub" } },
    model_run_id: "model-az-1",
    tokens_in: 5,
    tokens_out: 10,
    lease_ids: ["lease-1"],
    audit_event_ids: ["evt-1"],
  }),
}));

vi.mock("./openclaw-handoff.js", () => ({
  postGovernanceToOpenClaw: vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: '{"ok":true}',
  }),
}));

vi.mock("@linktrend/linklogic-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@linktrend/linklogic-sdk")>();
  return {
    ...actual,
    buildLinktrendGovernancePayload: vi.fn().mockResolvedValue({
      payload: { bootstrap: { traceCorrelationId: "t1", authorizationState: "granted" } },
    }),
  };
});

const baseEnv = {
  BOT_RUNTIME_SKILL_NAME: "bootstrap",
} as import("@linktrend/shared-config").Env;

const baseRequest = {
  tenant_id: "tenant-1",
  run_id: "00000000-0000-4000-8000-000000000002",
  stage_id: "stage-1",
  reasoning_kind: "research_enrichment" as const,
  model_routing_profile: "default",
  pii_policy: "strip_contact" as const,
  inputs: {},
};

describe("runtime-dispatch integration (Wave 2.8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes agent_zero mapping to AZ adapter not OpenClaw", async () => {
    const resolution = resolveRoleRuntime("research_enrichment_bot");
    expect(resolution).toEqual({
      runtime: "agent_zero",
      laneId: "az-linksites-research",
      roleId: "research_enrichment_bot",
    });

    const { dispatchAgentZeroMission } = await import("@linktrend/agent-zero-runtime");
    const handoff = await import("./openclaw-handoff.js");

    const result = await dispatchRoleRuntime(baseEnv, {
      ...baseRequest,
      role_id: "research_enrichment_bot",
    });

    expect(result.runtime).toBe("agent_zero");
    expect(result.lane_id).toBe("az-linksites-research");
    expect(vi.mocked(dispatchAgentZeroMission)).toHaveBeenCalledOnce();
    expect(vi.mocked(handoff.postGovernanceToOpenClaw)).not.toHaveBeenCalled();
    expect(result.outputs).toMatchObject({ lead_research_bundle: expect.any(Object) });
  });

  it("routes OpenClaw mapping when no AZ lane", async () => {
    const resolution = resolveRoleRuntime("outreach_bot");
    expect(resolution?.runtime).toBe("openclaw");

    const { dispatchAgentZeroMission } = await import("@linktrend/agent-zero-runtime");
    const handoff = await import("./openclaw-handoff.js");

    const result = await dispatchRoleRuntime(baseEnv, {
      ...baseRequest,
      role_id: "outreach_bot",
    });

    expect(result.runtime).toBe("openclaw");
    expect(result.agent_id).toBe("linksites-head");
    expect(vi.mocked(dispatchAgentZeroMission)).not.toHaveBeenCalled();
    expect(vi.mocked(handoff.postGovernanceToOpenClaw)).toHaveBeenCalledOnce();
  });

  it("prefers AZ over OpenClaw for librarian_bot", async () => {
    expect(resolveRoleRuntime("librarian_bot")).toEqual({
      runtime: "agent_zero",
      laneId: "az-librarian",
      roleId: "librarian_bot",
    });
  });
});
