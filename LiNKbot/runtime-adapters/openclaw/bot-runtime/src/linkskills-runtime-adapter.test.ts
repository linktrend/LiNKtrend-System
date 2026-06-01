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

  it("discloses only lease-scoped skill fragments just in time", () => {
    const adapter = createLinkSkillsRuntimeAdapter({
      governance,
      leases: [{ lease_id: "lease-1", operation_ids: ["skill.website_builder.v1"] }],
    });

    const result = adapter.discloseSkills({
      lease_id: "lease-1",
      idempotency_key: "run-1:stage-1:skill.website_builder.v1",
      requested_skill_ids: ["skill.website_builder.v1"],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.retention_policy).toBe("session_only_no_persist");
      expect(result.manifest.skill_ids).toEqual(["skill.website_builder.v1"]);
      expect(result.manifest.fragment_refs.map((fragment) => fragment.fragment_type)).toEqual([
        "decision_tree",
        "phase_instructions",
        "contracts",
      ]);
      expect(JSON.stringify(result.manifest)).not.toContain("content_preview");
      expect(JSON.stringify(result.manifest)).not.toContain("full_source");
    }
  });

  it("denies skill disclosure outside governance or lease scope", () => {
    const adapter = createLinkSkillsRuntimeAdapter({
      governance,
      leases: [{ lease_id: "lease-1", operation_ids: ["skill.website_builder.v1"] }],
    });

    const result = adapter.discloseSkills({
      lease_id: "lease-1",
      idempotency_key: "run-1:stage-1:skill.unapproved",
      requested_skill_ids: ["skill.unapproved"],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.code).toBe("LEASE_DENIED");
    }
  });

  it("denies full corpus and full-source disclosure requests", () => {
    const adapter = createLinkSkillsRuntimeAdapter({
      governance,
      leases: [{ lease_id: "lease-1", operation_ids: ["skill.website_builder.v1"] }],
    });

    const corpusResult = adapter.discloseSkills({
      lease_id: "lease-1",
      idempotency_key: "run-1:stage-1:skill.full_corpus",
      requested_skill_ids: ["skill.full_corpus"],
    });
    const fullSourceResult = adapter.discloseSkills({
      lease_id: "lease-1",
      idempotency_key: "run-1:stage-1:skill.website_builder.v1:full_source",
      requested_skill_ids: ["skill.website_builder.v1"],
      requested_fragment_types: ["full_source"],
    });

    expect(corpusResult.ok).toBe(false);
    expect(fullSourceResult.ok).toBe(false);
    if (!corpusResult.ok) {
      expect(corpusResult.failure.code).toBe("LEASE_DENIED");
    }
    if (!fullSourceResult.ok) {
      expect(fullSourceResult.failure.code).toBe("LEASE_DENIED");
    }
  });
});
