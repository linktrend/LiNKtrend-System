import type { LinktrendGovernancePayload } from "@linktrend/shared-types";
import { describe, expect, it } from "vitest";

import { createLinkSkillsRuntimeAdapter } from "./linkskills-runtime-adapter.js";

const governance: LinktrendGovernancePayload = {
  bootstrap: { traceCorrelationId: "tid-1", authorizationState: "granted" },
  approvedTools: {
    toolNames: ["cap.zulip.run_messaging", "skill.website_builder.v1", "read.logs"],
  },
};

describe("createLinkSkillsRuntimeAdapter", () => {
  it("requires lease_id for side-effect execution", () => {
    const adapter = createLinkSkillsRuntimeAdapter({
      governance,
      leases: [{ lease_id: "lease-1", operation_ids: ["cap.zulip.run_messaging"] }],
    });

    const result = adapter.execute({
      kind: "capability.execute",
      operation_id: "cap.zulip.run_messaging",
      idempotency_key: "run-1:stage-1:cap.zulip.run_messaging",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.code).toBe("LEASE_REQUEST_INVALID");
    }
  });

  it("denies operations outside governance/lease policy", () => {
    const adapter = createLinkSkillsRuntimeAdapter({
      governance,
      leases: [{ lease_id: "lease-1", operation_ids: ["cap.zulip.run_messaging"] }],
    });

    const result = adapter.execute({
      kind: "capability.execute",
      lease_id: "lease-1",
      operation_id: "cap.plane.execution_tracking",
      idempotency_key: "run-1:stage-1:cap.plane.execution_tracking",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.code).toBe("LEASE_DENIED");
    }
  });

  it("returns deterministic success on idempotent replay", () => {
    const adapter = createLinkSkillsRuntimeAdapter({
      governance,
      leases: [{ lease_id: "lease-1", operation_ids: ["cap.zulip.run_messaging"] }],
    });

    const request = {
      kind: "capability.execute" as const,
      lease_id: "lease-1",
      operation_id: "cap.zulip.run_messaging",
      idempotency_key: "run-1:stage-1:cap.zulip.run_messaging",
      payload: { channel: "ops", message: "run.notify" },
    };

    const first = adapter.execute(request);
    const replay = adapter.execute(request);

    expect(first).toMatchObject({ ok: true, replayed: false, lease_id: "lease-1" });
    expect(replay).toMatchObject({ ok: true, replayed: true, lease_id: "lease-1" });
  });
});
