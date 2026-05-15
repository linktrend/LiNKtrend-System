import { describe, expect, it } from "vitest";

import {
  AuditEventSchema,
  BotReasonRequestSchema,
  CrmUpsertArgsSchema,
  FailureCodeSchema,
  FailureReportSchema,
  LeadInputSchema,
  LeaseRequestSchema,
  PlaneSchema,
  PluginManifestSchema,
  PreviewOutputSchema,
  PreviewPublishArgsSchema,
  RunSchema,
  RunStatusSchema,
  StageStatusSchema,
  WorkflowInvokeRequestSchema,
} from "./contracts-mvo.js";

const RUN_ID = "11111111-1111-4111-8111-111111111111";
const WORK_REQUEST_ID = "22222222-2222-4222-8222-222222222222";
const EVENT_ID = "33333333-3333-4333-8333-333333333333";
const NOW = "2026-05-14T12:00:00.000Z";

describe("PlaneSchema", () => {
  it("rejects unknown planes", () => {
    expect(PlaneSchema.safeParse("openclaw").success).toBe(false);
  });

  it("accepts the five canonical planes", () => {
    for (const plane of [
      "linkaios",
      "linkbot",
      "linkskills",
      "linkautowork",
      "linkbrain",
    ]) {
      expect(PlaneSchema.safeParse(plane).success).toBe(true);
    }
  });
});

describe("RunStatusSchema + StageStatusSchema", () => {
  it("rejects unknown run status", () => {
    expect(RunStatusSchema.safeParse("done").success).toBe(false);
    expect(RunStatusSchema.safeParse("succeeded").success).toBe(true);
  });

  it("rejects unknown stage status", () => {
    expect(StageStatusSchema.safeParse("retrying").success).toBe(false);
    expect(StageStatusSchema.safeParse("awaiting_approval").success).toBe(true);
  });
});

describe("LeadInputSchema", () => {
  const base = {
    tenant_id: "t-1",
    source: "manual" as const,
    business_name: "Acme",
    industry: "saas",
  };

  it("accepts a minimal valid lead", () => {
    expect(LeadInputSchema.safeParse(base).success).toBe(true);
  });

  it("rejects missing business_name", () => {
    expect(
      LeadInputSchema.safeParse({ ...base, business_name: "" }).success,
    ).toBe(false);
  });

  it("rejects whitespace-only industry", () => {
    expect(LeadInputSchema.safeParse({ ...base, industry: "   " }).success).toBe(
      false,
    );
  });

  it("rejects non-E.164 phone", () => {
    expect(
      LeadInputSchema.safeParse({
        ...base,
        contact: { phone: "555-1234" },
      }).success,
    ).toBe(false);
  });

  it("rejects business_name longer than 200 chars", () => {
    expect(
      LeadInputSchema.safeParse({ ...base, business_name: "x".repeat(201) })
        .success,
    ).toBe(false);
  });

  it("rejects external_ids keys with bad shape", () => {
    expect(
      LeadInputSchema.safeParse({
        ...base,
        external_ids: { "Chatwoot-ID": "abc" },
      }).success,
    ).toBe(false);
  });
});

describe("PluginManifestSchema", () => {
  const manifest = {
    plugin_id: "websitefactory",
    plugin_name: "WebsiteFactory",
    version: "0.1.0",
    purpose: "lead-to-preview",
    public_surfaces: {
      work_request_types: ["websitefactory.lead_to_preview"],
      ui_panels: [],
      read_views: [],
    },
    stages: [
      {
        stage_id: "lead_intake",
        display_name: "Lead intake",
        responsible_plane: "linkaios" as const,
        inputs: ["lead_input"],
        outputs: ["lead_record_ref"],
        failure_mode: "abort_run" as const,
      },
    ],
    config_surfaces: [],
    required_capabilities: [],
    required_workflow_hooks: [],
    required_audit_events: [],
    preview_output_shape: { preview_url: "string" },
    non_goals: [],
  };

  it("accepts a valid manifest", () => {
    expect(PluginManifestSchema.safeParse(manifest).success).toBe(true);
  });

  it("rejects manifest with no stages", () => {
    expect(
      PluginManifestSchema.safeParse({ ...manifest, stages: [] }).success,
    ).toBe(false);
  });

  it("rejects stage with unknown plane", () => {
    const bad = {
      ...manifest,
      stages: [{ ...manifest.stages[0], responsible_plane: "openclaw" }],
    };
    expect(PluginManifestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects stage with unknown failure_mode", () => {
    const bad = {
      ...manifest,
      stages: [{ ...manifest.stages[0], failure_mode: "ignore" }],
    };
    expect(PluginManifestSchema.safeParse(bad).success).toBe(false);
  });
});

describe("FailureReportSchema", () => {
  it("accepts canonical integration failure codes", () => {
    for (const code of [
      "INTEGRATION_UNAVAILABLE",
      "INTEGRATION_AUTH_FAILED",
      "INTEGRATION_TIMEOUT",
    ]) {
      expect(FailureCodeSchema.safeParse(code).success).toBe(true);
    }
  });

  it("accepts a canonical retryable failure", () => {
    expect(
      FailureReportSchema.safeParse({
        code: "MODEL_TIMEOUT",
        plane: "linkbot",
        message: "model timed out",
        retryable: true,
        occurred_at: NOW,
      }).success,
    ).toBe(true);
  });

  it("rejects when required fields are missing", () => {
    expect(
      FailureReportSchema.safeParse({
        code: "MODEL_TIMEOUT",
        plane: "linkbot",
        message: "x",
      }).success,
    ).toBe(false);
  });
});

describe("RunSchema", () => {
  it("rejects unknown status", () => {
    const run = {
      run_id: RUN_ID,
      work_request_id: WORK_REQUEST_ID,
      tenant_id: "t-1",
      plugin_id: "websitefactory",
      status: "done",
      started_at: NOW,
      stages: [],
      outputs: {},
    };
    expect(RunSchema.safeParse(run).success).toBe(false);
  });
});

describe("BotReasonRequestSchema", () => {
  it("rejects pii_policy other than strip_contact", () => {
    expect(
      BotReasonRequestSchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        stage_id: "lead_evaluation",
        reasoning_kind: "lead_evaluation",
        inputs: {},
        model_routing_profile: "default",
        pii_policy: "allow",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown reasoning_kind", () => {
    expect(
      BotReasonRequestSchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        stage_id: "lead_evaluation",
        reasoning_kind: "summarization",
        inputs: {},
        model_routing_profile: "default",
        pii_policy: "strip_contact",
      }).success,
    ).toBe(false);
  });
});

describe("LeaseRequestSchema", () => {
  it("rejects missing idempotency_key", () => {
    expect(
      LeaseRequestSchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        stage_id: "crm_upsert",
        capability: "crm.upsert",
        arguments: {},
        actor: { actor_kind: "plugin", actor_id: "websitefactory" },
      }).success,
    ).toBe(false);
  });
});

describe("AuditEventSchema", () => {
  const base = {
    event_id: EVENT_ID,
    ts: NOW,
    tenant_id: "t-1",
    plane: "linkaios" as const,
    actor: { actor_kind: "kernel" as const, actor_id: "kernel" },
    action: "run.started",
    subject: { run_id: RUN_ID },
    payload: {},
    schema_version: "1" as const,
  };

  it("accepts a valid envelope", () => {
    expect(AuditEventSchema.safeParse(base).success).toBe(true);
  });

  it("rejects missing tenant_id", () => {
    expect(
      AuditEventSchema.safeParse({ ...base, tenant_id: "" }).success,
    ).toBe(false);
  });

  it("rejects missing action", () => {
    expect(AuditEventSchema.safeParse({ ...base, action: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing plane", () => {
    const { plane: _omit, ...rest } = base;
    expect(AuditEventSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects unknown plane", () => {
    expect(
      AuditEventSchema.safeParse({ ...base, plane: "openclaw" }).success,
    ).toBe(false);
  });

  it("rejects schema_version other than '1'", () => {
    expect(
      AuditEventSchema.safeParse({ ...base, schema_version: "2" }).success,
    ).toBe(false);
  });
});

describe("WorkflowInvokeRequestSchema", () => {
  it("requires workflow_handle + idempotency_key", () => {
    expect(
      WorkflowInvokeRequestSchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        stage_id: "look_and_feel",
        inputs: {},
      }).success,
    ).toBe(false);
  });
});

describe("CrmUpsertArgsSchema", () => {
  it("rejects malformed email", () => {
    expect(
      CrmUpsertArgsSchema.safeParse({
        tenant_id: "t-1",
        lead_id: "lead-1",
        business_name: "Acme",
        industry: "saas",
        contact_email: "not-an-email",
      }).success,
    ).toBe(false);
  });
});

describe("PreviewPublishArgsSchema", () => {
  it("rejects render_spec missing template_id", () => {
    expect(
      PreviewPublishArgsSchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        render_spec: {
          copy_bundle: { blocks: [], locale: "en" },
          media_plan: { placements: [] },
          theme: {},
        },
        preview_route_prefix: "/preview",
      }).success,
    ).toBe(false);
  });
});

describe("PreviewOutputSchema", () => {
  it("accepts null refs for crm/project/task", () => {
    expect(
      PreviewOutputSchema.safeParse({
        run_id: RUN_ID,
        tenant_id: "t-1",
        plugin_id: "websitefactory",
        preview_url: "https://example.test/preview/t-1/run",
        preview_artifact_ref: "artifact://x",
        crm_record_id: null,
        project_id: null,
        task_id: null,
        lease_ids: [],
        workflow_run_ids: [],
        audit_event_ids: [],
        status: "awaiting_approval",
      }).success,
    ).toBe(true);
  });

  it("rejects plugin_id other than websitefactory", () => {
    expect(
      PreviewOutputSchema.safeParse({
        run_id: RUN_ID,
        tenant_id: "t-1",
        plugin_id: "other",
        preview_url: "x",
        preview_artifact_ref: "y",
        crm_record_id: null,
        project_id: null,
        task_id: null,
        lease_ids: [],
        workflow_run_ids: [],
        audit_event_ids: [],
        status: "succeeded",
      }).success,
    ).toBe(false);
  });
});
