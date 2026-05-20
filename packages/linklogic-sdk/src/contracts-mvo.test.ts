import { describe, expect, it } from "vitest";

import {
  AuditEventSchema,
  BotReasonRequestSchema,
  CrmUpsertArgsSchema,
  FailureCodeSchema,
  FailureReportSchema,
  LeadInputSchema,
  LeaseRequestSchema,
  LinkSitesV2CapabilityPluginIdSchema,
  LinkSitesV2DiscoveredRefsSchema,
  LinkSitesV2PreviewReadinessSummarySchema,
  LinkSitesV2RoleIdSchema,
  LinkSitesV2TemplateIdSchema,
  LinkSitesV2WorkflowHandleSchema,
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

  it("accepts a v2 vertical manifest with kind, modes, and role attachments", () => {
    const v2 = {
      ...manifest,
      plugin_kind: "vertical" as const,
      modes_supported: ["development" as const],
      required_capabilities: ["crm.upsert"],
      required_audit_events: ["stage.completed"],
      required_linkbot_roles: [
        {
          role_id: "research_enrichment_bot",
          purpose: "research and enrich a lead",
          inputs: ["lead_record_ref"],
          outputs: ["lead_evaluation"],
          allowed_capabilities: ["crm.upsert"],
          allowed_skills: ["public_web_research"],
          model_policy: { model_routing_profile: "default" },
          audit_events: ["stage.completed"],
        },
      ],
    };
    expect(PluginManifestSchema.safeParse(v2).success).toBe(true);
  });

  it("rejects role attachment referencing undeclared capability", () => {
    const bad = {
      ...manifest,
      plugin_kind: "vertical" as const,
      modes_supported: ["development" as const],
      required_audit_events: ["stage.completed"],
      required_linkbot_roles: [
        {
          role_id: "rogue",
          purpose: "x",
          inputs: [],
          outputs: [],
          allowed_capabilities: ["unknown.capability"],
          allowed_skills: [],
          model_policy: { model_routing_profile: "default" },
          audit_events: ["stage.completed"],
        },
      ],
    };
    expect(PluginManifestSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts a v2 capability plugin manifest", () => {
    const cap = {
      ...manifest,
      plugin_id: "odoo_crm",
      plugin_kind: "capability" as const,
      modes_supported: ["development" as const, "shadow" as const],
      stages: [],
      required_capabilities: [],
      capability: {
        capability_id: "crm.upsert",
        target_software: "odoo",
        allowed_operations: ["upsert_lead"],
        auth_requirements: ["odoo_base_url", "odoo_api_key"],
        mode_flags: ["development", "shadow"],
        lease_requirements: ["crm.write"],
        idempotency_rules: "(tenant_id, lead_id)",
        audit_events: ["lease.executed", "crm.upserted"],
        allowed_callers: ["vertical_plugin"],
        failure_mapping: { TIMEOUT: "INTEGRATION_TIMEOUT" },
        not_configured: [
          "odoo chart of accounts",
          "odoo crm stages",
          "odoo email templates",
        ],
      },
    };
    expect(PluginManifestSchema.safeParse(cap).success).toBe(true);
  });

  it("rejects capability plugin with stages declared", () => {
    const bad = {
      ...manifest,
      plugin_kind: "capability" as const,
      capability: {
        capability_id: "crm.upsert",
        target_software: "odoo",
        allowed_operations: ["upsert_lead"],
        auth_requirements: [],
        mode_flags: ["development"],
        lease_requirements: [],
        idempotency_rules: "(tenant_id, lead_id)",
        audit_events: [],
        allowed_callers: ["vertical_plugin"],
        failure_mapping: {},
        not_configured: ["odoo internals"],
      },
    };
    expect(PluginManifestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects capability plugin missing capability block", () => {
    const bad = {
      ...manifest,
      plugin_kind: "capability" as const,
      stages: [],
    };
    expect(PluginManifestSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects capability plugin with empty not_configured", () => {
    const bad = {
      ...manifest,
      plugin_kind: "capability" as const,
      stages: [],
      capability: {
        capability_id: "crm.upsert",
        target_software: "odoo",
        allowed_operations: ["upsert_lead"],
        auth_requirements: [],
        mode_flags: ["development"],
        lease_requirements: [],
        idempotency_rules: "(tenant_id, lead_id)",
        audit_events: [],
        allowed_callers: ["vertical_plugin"],
        failure_mapping: {},
        not_configured: [],
      },
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

describe("LinkSites v2 focused schemas (WP-046)", () => {
  it("accepts only discovered template id", () => {
    expect(LinkSitesV2TemplateIdSchema.safeParse("marketing-smb-v1").success).toBe(
      true,
    );
    expect(LinkSitesV2TemplateIdSchema.safeParse("custom-template").success).toBe(
      false,
    );
  });

  it("accepts canonical v2 role ids and rejects unknown ids", () => {
    expect(LinkSitesV2RoleIdSchema.safeParse("website_builder_bot").success).toBe(
      true,
    );
    expect(LinkSitesV2RoleIdSchema.safeParse("qa_bot").success).toBe(false);
  });

  it("accepts canonical v2 capability plugin ids and rejects invented ids", () => {
    expect(
      LinkSitesV2CapabilityPluginIdSchema.safeParse("cap.payload.local_sync")
        .success,
    ).toBe(true);
    expect(
      LinkSitesV2CapabilityPluginIdSchema.safeParse("cap.payload.remote_live_sync")
        .success,
    ).toBe(false);
  });

  it("accepts canonical v2 workflow handles and rejects unknown handles", () => {
    expect(
      LinkSitesV2WorkflowHandleSchema.safeParse(
        "autowork.linksites.preview_readiness_check",
      ).success,
    ).toBe(true);
    expect(
      LinkSitesV2WorkflowHandleSchema.safeParse("autowork.linksites.publish_live")
        .success,
    ).toBe(false);
  });

  it("rejects invented discovered refs", () => {
    expect(
      LinkSitesV2DiscoveredRefsSchema.safeParse({
        template_registry_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/registry.ts",
        template_module_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/marketing-smb-v1.ts",
        payload_config_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/cms/src/payload.config.ts",
        supabase_schema_ref:
          "/Users/linktrend/Projects/LiNKsites/supabase/schemas/lsites_core.schema.json",
        supabase_cms_mapping_ref:
          "/Users/linktrend/Projects/LiNKsites/supabase/schemas/cms-mapping.json",
        payload_reader_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/web-master/src/lib/payload-client.ts",
      }).success,
    ).toBe(true);

    expect(
      LinkSitesV2DiscoveredRefsSchema.safeParse({
        template_registry_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/registry.ts",
        template_module_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/marketing-smb-v2.ts",
        payload_config_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/cms/src/payload.config.ts",
        supabase_schema_ref:
          "/Users/linktrend/Projects/LiNKsites/supabase/schemas/lsites_core.schema.json",
        supabase_cms_mapping_ref:
          "/Users/linktrend/Projects/LiNKsites/supabase/schemas/cms-mapping.json",
        payload_reader_ref:
          "/Users/linktrend/Projects/LiNKsites/apps/web-master/src/lib/payload-client.ts",
      }).success,
    ).toBe(false);
  });

  it("enforces development/local preview-readiness summary and status consistency", () => {
    expect(
      LinkSitesV2PreviewReadinessSummarySchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        lead_id: "lead-1",
        generation: {
          site_id: "site-1",
          site_generation_run_id: "gen-1",
        },
        template_id: "marketing-smb-v1",
        checks_passed: true,
        failed_checks: [],
        preview_readiness_status: "ready_to_contact",
        execution_mode: "development",
        generated_artifact_root_kind: "local",
      }).success,
    ).toBe(true);

    expect(
      LinkSitesV2PreviewReadinessSummarySchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        lead_id: "lead-1",
        generation: {
          site_id: "site-1",
          site_generation_run_id: "gen-1",
        },
        template_id: "marketing-smb-v1",
        checks_passed: true,
        failed_checks: [],
        preview_readiness_status: "ready_to_contact",
        execution_mode: "live",
        generated_artifact_root_kind: "local",
      }).success,
    ).toBe(false);

    expect(
      LinkSitesV2PreviewReadinessSummarySchema.safeParse({
        tenant_id: "t-1",
        run_id: RUN_ID,
        lead_id: "lead-1",
        generation: {
          site_id: "site-1",
          site_generation_run_id: "gen-1",
        },
        template_id: "marketing-smb-v1",
        checks_passed: false,
        failed_checks: ["missing navigation"],
        preview_readiness_status: "ready_to_contact",
        execution_mode: "development",
        generated_artifact_root_kind: "local",
      }).success,
    ).toBe(false);
  });
});
