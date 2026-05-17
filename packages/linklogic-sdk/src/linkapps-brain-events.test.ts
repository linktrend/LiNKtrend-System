import { describe, expect, it } from "vitest";

import {
  LinkappsBrainEventPayloadSchema,
  LinkappsHandoffArtifactMemoryPayloadSchema,
  LinkappsRunEventPayloadSchema,
  LinkappsSquadDecisionEventPayloadSchema,
  LinkappsCapabilityLeaseSummarySchema,
  parseLinkappsBrainEventPayload,
  parseLinkappsRunEventPayload,
  LINKAPPS_PLUGIN_ID,
} from "./linkapps-brain-events.js";

describe("LinkappsRunEventPayloadSchema", () => {
  it("accepts a minimal valid run checkpoint payload", () => {
    const p = parseLinkappsRunEventPayload({
      schema_version: "linkapps.brain.run_event.v1",
      plugin_id: LINKAPPS_PLUGIN_ID,
      work_request_type: "linkapps.app_factory.blueprint_to_app",
      checkpoint_kind: "blueprint.received",
      blueprint_ref: "memref:blueprint/bp_abc123",
      redaction_flags: ["prd_contact_strip"],
    });
    expect(p.checkpoint_kind).toBe("blueprint.received");
  });

  it("rejects unknown checkpoint kinds", () => {
    expect(() =>
      LinkappsRunEventPayloadSchema.parse({
        schema_version: "linkapps.brain.run_event.v1",
        plugin_id: LINKAPPS_PLUGIN_ID,
        work_request_type: "linkapps.app_factory.squad_execution",
        checkpoint_kind: "invalid.checkpoint",
      }),
    ).toThrow();
  });

  it("rejects stray tenant or contact keys (strict)", () => {
    expect(() =>
      LinkappsRunEventPayloadSchema.parse({
        schema_version: "linkapps.brain.run_event.v1",
        plugin_id: LINKAPPS_PLUGIN_ID,
        work_request_type: "linkapps.app_factory.prd_to_repo",
        checkpoint_kind: "repo.scaffold.requested",
        tenant_id: "t-hidden",
      }),
    ).toThrow();
  });
});

describe("LinkappsSquadDecisionEventPayloadSchema", () => {
  it("parses a squad gate decision with lease summaries", () => {
    const p = LinkappsSquadDecisionEventPayloadSchema.parse({
      schema_version: "linkapps.brain.squad_decision.v1",
      plugin_id: LINKAPPS_PLUGIN_ID,
      decision_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
      decision_kind: "gate_hold",
      from_role_id: "technical_lead",
      blocking: true,
      rationale_summary: "Blocked pending architecture note attachment.",
      artifact_refs: [{ artifact_kind: "architecture_notes_ref", artifact_ref: "blob://notes/arch-77" }],
      lease_summaries: [
        {
          schema_version: "linkapps.brain.lease_summary.v1",
          lease_ref: "lease_hdl_01",
          capability_plugin_id: "cap.github.repo_management",
          operation_id: "repo.create_from_template",
          decision_status: "granted",
        },
      ],
    });
    expect(p.lease_summaries?.[0]?.operation_id).toBe("repo.create_from_template");
  });

  it("rejects email-like rationale summaries", () => {
    expect(() =>
      LinkappsSquadDecisionEventPayloadSchema.parse({
        schema_version: "linkapps.brain.squad_decision.v1",
        plugin_id: LINKAPPS_PLUGIN_ID,
        decision_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
        decision_kind: "escalate_operator",
        blocking: true,
        rationale_summary: "Contact owner@example.com for approval",
      }),
    ).toThrow(/email-like/);
  });

  it("rejects phone-like rationale summaries", () => {
    expect(() =>
      LinkappsSquadDecisionEventPayloadSchema.parse({
        schema_version: "linkapps.brain.squad_decision.v1",
        plugin_id: LINKAPPS_PLUGIN_ID,
        decision_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
        decision_kind: "escalate_operator",
        blocking: true,
        rationale_summary: "Call +1 (415) 555-0199 immediately",
      }),
    ).toThrow(/NANP-style|phone-number-shaped/);
  });
});

describe("LinkappsCapabilityLeaseSummarySchema", () => {
  it("accepts denied leases without arguments blobs", () => {
    const s = LinkappsCapabilityLeaseSummarySchema.parse({
      schema_version: "linkapps.brain.lease_summary.v1",
      lease_ref: "lease_hdl_denied",
      capability_plugin_id: "cap.stripe.product_management",
      operation_id: "catalog.snapshot_mock",
      decision_status: "denied",
      kill_switch_tripped: true,
    });
    expect(s.decision_status).toBe("denied");
  });

  it("rejects embedded credential-ish keys", () => {
    expect(() =>
      LinkappsCapabilityLeaseSummarySchema.parse({
        schema_version: "linkapps.brain.lease_summary.v1",
        lease_ref: "lease_hdl_x",
        capability_plugin_id: "cap.supabase.provisioning",
        operation_id: "project.scaffold_stub",
        decision_status: "granted",
        api_key: "secret",
      }),
    ).toThrow();
  });
});

describe("LinkappsHandoffArtifactMemoryPayloadSchema", () => {
  it("requires at least one artifact record", () => {
    expect(() =>
      LinkappsHandoffArtifactMemoryPayloadSchema.parse({
        schema_version: "linkapps.brain.handoff_memory.v1",
        plugin_id: LINKAPPS_PLUGIN_ID,
        handoff_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
        from_stage_ref: "stage:5.4.ai_implementation",
        to_stage_ref: "stage:5.5.quality_validation",
        producer_role_id: "backend_specialist",
        artifact_index: [],
        visibility: "squad_internal",
        pii_redaction_verified: true,
      }),
    ).toThrow();
  });

  it("accepts digested artifact refs", () => {
    const h = LinkappsHandoffArtifactMemoryPayloadSchema.parse({
      schema_version: "linkapps.brain.handoff_memory.v1",
      plugin_id: LINKAPPS_PLUGIN_ID,
      handoff_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
      from_stage_ref: "stage:5.6.deployment",
      to_stage_ref: "stage:5.7.handoff_pack",
      producer_role_id: "devops_engineer",
      artifact_index: [
        {
          artifact_kind: "deployment_bundle",
          storage_ref: "artifact://bundles/app-x.tgz",
          content_digest_sha256: "a".repeat(64),
        },
      ],
      visibility: "squad_internal",
      pii_redaction_verified: true,
    });
    expect(h.artifact_index[0]?.content_digest_sha256).toHaveLength(64);
  });

  it("rejects malformed digests", () => {
    expect(() =>
      LinkappsHandoffArtifactMemoryPayloadSchema.parse({
        schema_version: "linkapps.brain.handoff_memory.v1",
        plugin_id: LINKAPPS_PLUGIN_ID,
        handoff_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
        from_stage_ref: "stage:a",
        to_stage_ref: "stage:b",
        producer_role_id: "technical_lead",
        artifact_index: [
          {
            artifact_kind: "bundle",
            storage_ref: "artifact://x",
            content_digest_sha256: "not-a-hash",
          },
        ],
        visibility: "squad_internal",
        pii_redaction_verified: false,
      }),
    ).toThrow();
  });
});

describe("LinkappsBrainEventPayloadSchema (discriminated union)", () => {
  it("dispatches on schema_version", () => {
    const run = parseLinkappsBrainEventPayload({
      schema_version: "linkapps.brain.run_event.v1",
      plugin_id: LINKAPPS_PLUGIN_ID,
      work_request_type: "linkapps.app_factory.spinoff_prep",
      checkpoint_kind: "handoff.package.started",
    });
    expect(run.schema_version).toBe("linkapps.brain.run_event.v1");
  });
});
