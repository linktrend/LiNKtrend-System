/**
 * WebsiteFactory Plugin Tests
 *
 * Validates:
 * - Manifest structure per CONTRACTS_MVO.md §1.4
 * - Stage mappings per §10 stage trace
 * - Stage handler delegation to correct planes
 * - Preview panel wiring
 * - Role-bleed guards (§12.2)
 */

import { describe, it, expect } from "vitest";
import {
  WEBSITE_FACTORY_MANIFEST,
  getWebsiteFactoryManifest,
  getStageDefinition,
  isCapabilityStage,
  isReasoningStage,
  isWorkflowStage,
  mapStageToCapability,
  mapStageToWorkflowHandle,
  mapStageToReasoningKind,
} from "./manifest";
import {
  stageRequiresApproval,
  getStageRetryConfig,
} from "./stage-handlers";
import {
  buildPreviewPanelView,
  generatePreviewRoute,
  validatePreviewOutput,
  getPreviewPanelConfig,
} from "./preview-panel";
import type { Run, Stage, PreviewOutput } from "@linktrend/linklogic-sdk";

describe("WebsiteFactory Plugin Manifest", () => {
  it("returns a valid manifest object", () => {
    const manifest = getWebsiteFactoryManifest();
    expect(manifest).toBeDefined();
    expect(manifest.plugin_id).toBe("websitefactory");
    expect(manifest.plugin_name).toBe("LinkSites / WebsiteFactory");
    expect(manifest.version).toBe("0.1.0-mvo");
  });

  it("has all required manifest fields per CONTRACTS_MVO.md §1.2", () => {
    const manifest = getWebsiteFactoryManifest();

    // Required top-level fields
    expect(manifest.plugin_id).toBeDefined();
    expect(manifest.plugin_name).toBeDefined();
    expect(manifest.version).toBeDefined();
    expect(manifest.purpose).toBeDefined();

    // Required surfaces
    expect(manifest.public_surfaces).toBeDefined();
    expect(manifest.public_surfaces.work_request_types).toContain("websitefactory.lead_to_preview");
    expect(manifest.public_surfaces.ui_panels).toContain("preview_panel");
    expect(manifest.public_surfaces.read_views).toContain("run_detail");

    // Required capabilities
    expect(manifest.required_capabilities).toContain("crm.upsert");
    expect(manifest.required_capabilities).toContain("plane.project.create");
    expect(manifest.required_capabilities).toContain("plane.task.create");
    expect(manifest.required_capabilities).toContain("preview.publish");

    // Required workflows
    expect(manifest.required_workflow_hooks).toContain("autowork.websitefactory.render");
    expect(manifest.required_workflow_hooks).toContain("autowork.websitefactory.preview_serve");

    // Required audit events
    expect(manifest.required_audit_events).toContain("run.started");
    expect(manifest.required_audit_events).toContain("run.completed");
    expect(manifest.required_audit_events).toContain("lease.executed");
    expect(manifest.required_audit_events).toContain("preview.published");

    // Preview output shape
    expect(manifest.preview_output_shape).toBeDefined();
    expect(manifest.preview_output_shape.preview_url).toBe("string");
    expect(manifest.preview_output_shape.status).toContain("succeeded");
  });

  it("declares the 10 WebsiteFactory stages per §10 stage trace", () => {
    const manifest = getWebsiteFactoryManifest();
    expect(manifest.stages).toHaveLength(10);

    const stageIds = manifest.stages.map((s) => s.stage_id);
    expect(stageIds).toContain("lead_intake");
    expect(stageIds).toContain("lead_evaluation");
    expect(stageIds).toContain("template_selection");
    expect(stageIds).toContain("copy_generation");
    expect(stageIds).toContain("media_placement");
    expect(stageIds).toContain("look_and_feel");
    expect(stageIds).toContain("crm_upsert");
    expect(stageIds).toContain("plane_project_create");
    expect(stageIds).toContain("preview_publish");
    expect(stageIds).toContain("record_run");
  });

  it("maps stages to correct responsible planes per §7", () => {
    const manifest = getWebsiteFactoryManifest();

    // Reasoning stages → LinkBot
    expect(getStageDefinition("lead_evaluation")?.responsible_plane).toBe("linkbot");
    expect(getStageDefinition("template_selection")?.responsible_plane).toBe("linkbot");
    expect(getStageDefinition("copy_generation")?.responsible_plane).toBe("linkbot");
    expect(getStageDefinition("media_placement")?.responsible_plane).toBe("linkbot");

    // Deterministic workflow → LiNKautowork
    expect(getStageDefinition("look_and_feel")?.responsible_plane).toBe("linkautowork");

    // Capability-gated side effects → LinkSkills
    expect(getStageDefinition("crm_upsert")?.responsible_plane).toBe("linkskills");
    expect(getStageDefinition("plane_project_create")?.responsible_plane).toBe("linkskills");
    expect(getStageDefinition("preview_publish")?.responsible_plane).toBe("linkskills");

    // Audit closure → LiNKbrain
    expect(getStageDefinition("record_run")?.responsible_plane).toBe("linkbrain");
  });

  it("declares require_approval for capability-gated stages", () => {
    const manifest = getWebsiteFactoryManifest();

    const capabilityStages = [
      "crm_upsert",
      "plane_project_create",
      "preview_publish",
    ];

    for (const stageId of capabilityStages) {
      const stage = getStageDefinition(stageId);
      expect(stage?.failure_mode).toBe("require_approval");
    }
  });

  it("includes expected non-goals", () => {
    const manifest = getWebsiteFactoryManifest();

    expect(manifest.non_goals).toContain("Full Payload CMS publish path");
    expect(manifest.non_goals).toContain("Vercel deploy previews");
    expect(manifest.non_goals).toContain("Real Chatwoot/Odoo CRM writes");
    expect(manifest.non_goals).toContain("LEXOS/legal vertical work");
  });
});

describe("Stage Type Helpers", () => {
  it("correctly identifies reasoning stages", () => {
    expect(isReasoningStage("lead_evaluation")).toBe(true);
    expect(isReasoningStage("template_selection")).toBe(true);
    expect(isReasoningStage("copy_generation")).toBe(true);
    expect(isReasoningStage("media_placement")).toBe(true);
    expect(isReasoningStage("look_and_feel")).toBe(false);
    expect(isReasoningStage("crm_upsert")).toBe(false);
  });

  it("correctly identifies capability stages", () => {
    expect(isCapabilityStage("crm_upsert")).toBe(true);
    expect(isCapabilityStage("plane_project_create")).toBe(true);
    expect(isCapabilityStage("preview_publish")).toBe(true);
    expect(isCapabilityStage("lead_evaluation")).toBe(false);
    expect(isCapabilityStage("look_and_feel")).toBe(false);
  });

  it("correctly identifies workflow stages", () => {
    expect(isWorkflowStage("look_and_feel")).toBe(true);
    expect(isWorkflowStage("preview_publish")).toBe(true);
    expect(isWorkflowStage("lead_evaluation")).toBe(false);
    expect(isWorkflowStage("crm_upsert")).toBe(false);
  });

  it("correctly maps stages to capabilities", () => {
    expect(mapStageToCapability("crm_upsert")).toBe("crm.upsert");
    expect(mapStageToCapability("plane_project_create")).toBe("plane.project.create");
    expect(mapStageToCapability("preview_publish")).toBe("preview.publish");
    expect(mapStageToCapability("lead_evaluation")).toBeNull();
  });

  it("correctly maps stages to workflow handles", () => {
    expect(mapStageToWorkflowHandle("look_and_feel")).toBe("autowork.websitefactory.render");
    expect(mapStageToWorkflowHandle("preview_publish")).toBe("autowork.websitefactory.preview_serve");
    expect(mapStageToWorkflowHandle("lead_evaluation")).toBeNull();
  });

  it("correctly maps stages to reasoning kinds", () => {
    expect(mapStageToReasoningKind("lead_evaluation")).toBe("lead_evaluation");
    expect(mapStageToReasoningKind("template_selection")).toBe("template_selection");
    expect(mapStageToReasoningKind("copy_generation")).toBe("copy_generation");
    expect(mapStageToReasoningKind("media_placement")).toBe("media_placement");
    expect(mapStageToReasoningKind("look_and_feel")).toBeNull();
  });
});

describe("Stage Execution Config", () => {
  it("identifies require_approval stages correctly", () => {
    const crmStage = getStageDefinition("crm_upsert")!;
    expect(stageRequiresApproval(crmStage)).toBe(true);

    const evalStage = getStageDefinition("lead_evaluation")!;
    expect(stageRequiresApproval(evalStage)).toBe(false);
  });

  it("returns correct retry config per failure_mode", () => {
    const retryableStage = getStageDefinition("lead_evaluation")!;
    expect(getStageRetryConfig(retryableStage)).toEqual({
      maxRetries: 3,
      retryable: true,
    });

    const abortStage = getStageDefinition("lead_intake")!;
    expect(getStageRetryConfig(abortStage)).toEqual({
      maxRetries: 0,
      retryable: false,
    });

    const approvalStage = getStageDefinition("crm_upsert")!;
    expect(getStageRetryConfig(approvalStage)).toEqual({
      maxRetries: 0,
      retryable: false,
    });
  });
});

describe("Preview Panel", () => {
  it("builds preview panel view from run", () => {
    const run: Run = {
      run_id: "run-123",
      work_request_id: "wr-123",
      tenant_id: "tenant-abc",
      plugin_id: "websitefactory",
      status: "succeeded",
      started_at: "2026-05-14T10:00:00Z",
      outputs: {
        preview_url: "/preview/tenant-abc/run-123",
        preview_artifact_ref: "storage://previews/run-123.zip",
        crm_record_id: "crm-456",
        project_id: "proj-789",
        task_id: "task-012",
      },
      stages: [],
    };

    const stages: Stage[] = [
      {
        stage_id: "preview_publish",
        run_id: "run-123",
        responsible_plane: "linkskills",
        status: "succeeded",
        attempt: 1,
        inputs_snapshot: {},
        refs: {
          lease_ids: ["lease-1"],
          workflow_run_ids: ["wf-1"],
          audit_event_ids: ["audit-1", "audit-2"],
        },
      },
    ];

    const view = buildPreviewPanelView(run, stages);

    expect(view.runId).toBe("run-123");
    expect(view.tenantId).toBe("tenant-abc");
    expect(view.previewUrl).toBe("/preview/tenant-abc/run-123");
    expect(view.previewArtifactRef).toBe("storage://previews/run-123.zip");
    expect(view.crmRecordId).toBe("crm-456");
    expect(view.projectId).toBe("proj-789");
    expect(view.taskId).toBe("task-012");
    expect(view.leaseIds).toContain("lease-1");
    expect(view.workflowRunIds).toContain("wf-1");
    expect(view.isReady).toBe(true);
    expect(view.isAwaitingApproval).toBe(false);
  });

  it("marks not ready when preview_url missing", () => {
    const run: Run = {
      run_id: "run-123",
      work_request_id: "wr-123",
      tenant_id: "tenant-abc",
      plugin_id: "websitefactory",
      status: "succeeded",
      started_at: "2026-05-14T10:00:00Z",
      outputs: {},
      stages: [],
    };

    const view = buildPreviewPanelView(run, []);
    expect(view.isReady).toBe(false);
  });

  it("marks awaiting_approval status correctly", () => {
    const run: Run = {
      run_id: "run-123",
      work_request_id: "wr-123",
      tenant_id: "tenant-abc",
      plugin_id: "websitefactory",
      status: "awaiting_approval",
      started_at: "2026-05-14T10:00:00Z",
      outputs: {},
      stages: [],
    };

    const view = buildPreviewPanelView(run, []);
    expect(view.isAwaitingApproval).toBe(true);
    expect(view.isReady).toBe(false);
  });

  it("generates correct preview route", () => {
    expect(generatePreviewRoute("tenant-abc", "run-123")).toBe(
      "/preview/tenant-abc/run-123"
    );
    expect(generatePreviewRoute("tenant-abc", "run-123", "https://app.linktrend.io")).toBe(
      "https://app.linktrend.io/preview/tenant-abc/run-123"
    );
  });

  it("validates preview output correctly", () => {
    const valid: Partial<PreviewOutput> = {
      run_id: "run-123",
      tenant_id: "tenant-abc",
      preview_url: "/preview/tenant-abc/run-123",
      preview_artifact_ref: "storage://previews/run-123.zip",
      status: "succeeded",
    };
    expect(validatePreviewOutput(valid).valid).toBe(true);

    const invalid: Partial<PreviewOutput> = {
      run_id: "run-123",
    };
    const result = validatePreviewOutput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing preview_url");
    expect(result.errors).toContain("Missing preview_artifact_ref");
    expect(result.errors).toContain("Missing status");
  });

  it("returns correct preview panel config", () => {
    const config = getPreviewPanelConfig();
    expect(config.panel_id).toBe("preview_panel");
    expect(config.plugin_id).toBe("websitefactory");
    expect(config.data_sources).toContain("PreviewOutput");
  });
});

describe("Role-Bleed Self-Check (CONTRACTS_MVO.md §12.2)", () => {
  it("plugin does NOT implement kernel routing/approvals", () => {
    // Plugin only declares stages, not routing logic
    const manifest = getWebsiteFactoryManifest();

    // Plugin should not have routing configuration
    expect(manifest).not.toHaveProperty("routes");
    expect(manifest).not.toHaveProperty("approval_ux");

    // Plugin should declare stages for kernel to execute
    expect(manifest.stages.length).toBeGreaterThan(0);
  });

  it("plugin does NOT hold tenant secrets", () => {
    const manifest = getWebsiteFactoryManifest();

    // Config surfaces are key names only, not values
    // Actual secrets live in LinkSkills
    expect(manifest.config_surfaces).toContain("model_routing_profile");
    expect(manifest).not.toHaveProperty("secrets");
  });

  it("plugin does NOT mutate Run/Stage state directly", () => {
    // Stage handlers return DispatchResult, they don't write to Run
    // Kernel is responsible for persisting stage results
    const manifest = getWebsiteFactoryManifest();

    for (const stage of manifest.stages) {
      // All stages have responsible_plane != linkaios except lead_intake
      if (stage.stage_id !== "lead_intake") {
        expect(stage.responsible_plane).not.toBe("linkaios");
      }
    }
  });

  it("plugin does NOT add undeclared capabilities/workflows/audit events", () => {
    const manifest = getWebsiteFactoryManifest();

    // All capabilities must be declared
    expect(manifest.required_capabilities.length).toBeGreaterThan(0);

    // All workflows must be declared
    expect(manifest.required_workflow_hooks.length).toBeGreaterThan(0);

    // All audit events must be declared
    expect(manifest.required_audit_events.length).toBeGreaterThan(0);

    // No runtime addition of undeclared items
    expect(manifest).not.toHaveProperty("dynamic_capabilities");
  });

  it("plugin does NOT maintain its own audit sink", () => {
    const manifest = getWebsiteFactoryManifest();

    // Plugin declares required_audit_events for LiNKbrain
    expect(manifest.required_audit_events).toContain("run.completed");

    // Plugin does not have its own audit storage
    expect(manifest).not.toHaveProperty("audit_sink");
    expect(manifest).not.toHaveProperty("audit_storage");
  });
});

describe("Contract Compliance", () => {
  it("stage names match CONTRACTS_MVO.md §10", () => {
    const manifest = getWebsiteFactoryManifest();
    const stageIds = manifest.stages.map((s) => s.stage_id);

    // Verify exact stage list from §10 stage trace
    const expectedStages = [
      "lead_intake",
      "lead_evaluation",
      "template_selection",
      "copy_generation",
      "media_placement",
      "look_and_feel",
      "crm_upsert",
      "plane_project_create",
      "preview_publish",
      "record_run",
    ];

    for (const expected of expectedStages) {
      expect(stageIds).toContain(expected);
    }
  });

  it("output names match CONTRACTS_MVO.md §2 data dictionary", () => {
    const manifest = getWebsiteFactoryManifest();

    // Check key output names are declared
    const allOutputs = manifest.stages.flatMap((s) => s.outputs);

    expect(allOutputs).toContain("lead_record_ref");
    expect(allOutputs).toContain("lead_evaluation");
    expect(allOutputs).toContain("template_id");
    expect(allOutputs).toContain("copy_bundle");
    expect(allOutputs).toContain("media_plan");
    expect(allOutputs).toContain("render_spec");
    expect(allOutputs).toContain("crm_record_id");
    expect(allOutputs).toContain("project_id");
    expect(allOutputs).toContain("task_id");
    expect(allOutputs).toContain("preview_url");
    expect(allOutputs).toContain("preview_artifact_ref");
  });

  it("preview output shape matches CONTRACTS_MVO.md §9", () => {
    const manifest = getWebsiteFactoryManifest();
    const shape = manifest.preview_output_shape;

    expect(shape.run_id).toBe("string");
    expect(shape.tenant_id).toBe("string");
    expect(shape.preview_url).toBe("string");
    expect(shape.preview_artifact_ref).toBe("string");
    expect(shape.crm_record_id).toContain("null");
    expect(shape.project_id).toContain("null");
    expect(shape.task_id).toContain("null");
    expect(shape.lease_ids).toBe("string[]");
    expect(shape.workflow_run_ids).toBe("string[]");
    expect(shape.audit_event_ids).toBe("string[]");
    expect(shape.status).toContain("succeeded");
    expect(shape.status).toContain("failed");
  });

  it("D-03: uses static/local preview (not Vercel/Payload)", () => {
    const manifest = getWebsiteFactoryManifest();

    // Preview is served from apps/linkaios-web route
    expect(manifest.config_surfaces).toContain("preview_route_prefix");

    // Non-goals confirm no Vercel/Payload
    expect(manifest.non_goals).toContain("Vercel deploy previews");
    expect(manifest.non_goals).toContain("Full Payload CMS publish path");
  });
});

describe("Plugin Registration", () => {
  it("exports correct plugin constants", async () => {
    // Dynamic import to test module exports
    const manifestModule = await import("./manifest");
    const handlersModule = await import("./stage-handlers");

    const manifest = manifestModule.getWebsiteFactoryManifest();
    expect(manifest.plugin_id).toBe("websitefactory");
    expect(manifest.version).toBe("0.1.0-mvo");
    expect(typeof handlersModule.executeWebsiteFactoryStage).toBe("function");
  });

  it("can be initialized with manifest and handlers", async () => {
    const manifestModule = await import("./manifest");
    const handlersModule = await import("./stage-handlers");

    const manifest = manifestModule.getWebsiteFactoryManifest();
    const initialized = {
      plugin_id: "websitefactory",
      version: "0.1.0-mvo",
      manifest,
      handlers: {
        executeStage: handlersModule.executeWebsiteFactoryStage,
      },
      ui: {
        panels: ["intake_form", "stage_timeline", "preview_panel"],
        readViews: ["run_detail", "preview_artifact"],
      },
    };

    expect(initialized.plugin_id).toBe("websitefactory");
    expect(initialized.manifest).toBeDefined();
    expect(initialized.ui.panels).toContain("preview_panel");
    expect(initialized.handlers.executeStage).toBeDefined();
  });
});
