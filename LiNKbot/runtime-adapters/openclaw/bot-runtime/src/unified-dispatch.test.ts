import { beforeEach, describe, expect, it, vi } from "vitest";

import { dispatchUnifiedRuntime, resolveUnifiedRuntimeTier } from "./unified-dispatch.js";

vi.mock("./runtime-dispatch.js", () => ({
  dispatchRoleRuntime: vi.fn().mockResolvedValue({
    runtime: "agent_zero",
    lane_id: "az-linksites-research",
    outputs: { lead_research_bundle: {} },
    model_run_id: "model-1",
    tokens_in: 1,
    tokens_out: 2,
  }),
  resolveRoleRuntime: vi.fn(),
}));

const baseEnv = {} as import("@linktrend/shared-config").Env;

const baseRequest = {
  tenant_id: "tenant-1",
  run_id: "00000000-0000-4000-8000-000000000002",
  stage_id: "stage-1",
  role_id: "research_enrichment_bot",
  reasoning_kind: "research_enrichment" as const,
  model_routing_profile: "default",
  pii_policy: "strip_contact" as const,
  inputs: {},
};

describe("unified-dispatch (Wave 5.5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes automation tier to linkautowork trace", async () => {
    expect(
      resolveUnifiedRuntimeTier({
        ...baseRequest,
        runtime_tier: "automation",
        workflow_handle: "autowork.linksites.artifact_write_local",
      }),
    ).toBe("automation");

    const result = await dispatchUnifiedRuntime(baseEnv, {
      ...baseRequest,
      runtime_tier: "automation",
      workflow_handle: "autowork.linksites.artifact_write_local",
    });

    expect(result.runtime_chosen).toBe("automation");
    expect(result.dispatch_target).toBe("linkautowork");
    expect(result.workflow_handle).toBe("autowork.linksites.artifact_write_local");
  });

  it("routes codex_lane tier without OpenClaw", async () => {
    const { dispatchRoleRuntime } = await import("./runtime-dispatch.js");
    const result = await dispatchUnifiedRuntime(baseEnv, {
      ...baseRequest,
      runtime_tier: "codex_lane",
      issue_id: "linkdeveloper.code.implement",
    });
    expect(result.runtime_chosen).toBe("codex_lane");
    expect(result.dispatch_target).toBe("codex_lane");
    expect(vi.mocked(dispatchRoleRuntime)).not.toHaveBeenCalled();
  });

  it("routes agent_zero via role dispatch", async () => {
    const { dispatchRoleRuntime } = await import("./runtime-dispatch.js");
    const result = await dispatchUnifiedRuntime(baseEnv, {
      ...baseRequest,
      runtime_tier: "agent_zero",
    });
    expect(result.runtime_chosen).toBe("agent_zero");
    expect(result.dispatch_target).toBe("agent_zero");
    expect(vi.mocked(dispatchRoleRuntime)).toHaveBeenCalledOnce();
  });
});
