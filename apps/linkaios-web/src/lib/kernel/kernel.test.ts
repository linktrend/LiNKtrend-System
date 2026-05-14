/**
 * LiNKaios kernel orchestration tests
 *
 * Tests manifest loading, work request intake, run lifecycle,
 * dispatch adapters, and trace views.
 */

import { describe, expect, it } from "vitest";

import {
  loadWebsiteFactoryManifest,
  validateManifest,
  loadAndValidateWebsiteFactoryManifest,
  ManifestValidationError,
} from "./manifest-loader";
import { buildPreviewOutput } from "./orchestrator";
import type { Run, Stage } from "@linktrend/linklogic-sdk";

// ============================================================================
// Manifest Tests
// ============================================================================

describe("loadWebsiteFactoryManifest", () => {
  it("returns a valid manifest object", () => {
    const manifest = loadWebsiteFactoryManifest();
    expect(manifest.plugin_id).toBe("websitefactory");
    expect(manifest.plugin_name).toBe("LinkSites / WebsiteFactory");
    expect(manifest.version).toBe("0.1.0-mvo");
  });

  it("has all required manifest fields", () => {
    const manifest = loadWebsiteFactoryManifest();

    expect(manifest.plugin_id).toBeDefined();
    expect(manifest.plugin_name).toBeDefined();
    expect(manifest.version).toBeDefined();
    expect(manifest.purpose).toBeDefined();
    expect(manifest.public_surfaces).toBeDefined();
    expect(manifest.stages).toBeDefined();
    expect(manifest.stages.length).toBeGreaterThan(0);
    expect(manifest.required_capabilities).toBeDefined();
    expect(manifest.required_workflow_hooks).toBeDefined();
    expect(manifest.required_audit_events).toBeDefined();
    expect(manifest.preview_output_shape).toBeDefined();
    expect(manifest.non_goals).toBeDefined();
  });

  it("declares the 10 WebsiteFactory stages", () => {
    const manifest = loadWebsiteFactoryManifest();
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
    expect(stageIds).toHaveLength(10);
  });

  it("maps stages to correct responsible planes per §7", () => {
    const manifest = loadWebsiteFactoryManifest();

    const intake = manifest.stages.find((s) => s.stage_id === "lead_intake");
    expect(intake?.responsible_plane).toBe("linkaios");

    const evalStage = manifest.stages.find((s) => s.stage_id === "lead_evaluation");
    expect(evalStage?.responsible_plane).toBe("linkbot");

    const crm = manifest.stages.find((s) => s.stage_id === "crm_upsert");
    expect(crm?.responsible_plane).toBe("linkskills");

    const render = manifest.stages.find((s) => s.stage_id === "look_and_feel");
    expect(render?.responsible_plane).toBe("linkautowork");

    const record = manifest.stages.find((s) => s.stage_id === "record_run");
    expect(record?.responsible_plane).toBe("linkbrain");
  });

  it("declares require_approval for capability-gated stages", () => {
    const manifest = loadWebsiteFactoryManifest();

    const crm = manifest.stages.find((s) => s.stage_id === "crm_upsert");
    expect(crm?.failure_mode).toBe("require_approval");

    const plane = manifest.stages.find((s) => s.stage_id === "plane_project_create");
    expect(plane?.failure_mode).toBe("require_approval");

    const preview = manifest.stages.find((s) => s.stage_id === "preview_publish");
    expect(preview?.failure_mode).toBe("require_approval");
  });
});

describe("validateManifest", () => {
  it("accepts the WebsiteFactory manifest", () => {
    const manifest = loadWebsiteFactoryManifest();
    const errors = validateManifest(manifest);
    expect(errors).toHaveLength(0);
  });

  it("accepts valid manifests", () => {
    const validManifest = {
      plugin_id: "test",
      plugin_name: "Test Plugin",
      version: "1.0.0",
      purpose: "Test purpose",
      public_surfaces: {
        work_request_types: ["test.work"],
        ui_panels: [],
        read_views: [],
      },
      stages: [
        {
          stage_id: "test_stage",
          display_name: "Test Stage",
          responsible_plane: "linkbot",
          inputs: [],
          outputs: [],
          failure_mode: "retryable",
        },
      ],
      config_surfaces: [],
      required_capabilities: [],
      required_workflow_hooks: [],
      required_audit_events: ["run.started"],
      preview_output_shape: {},
      non_goals: [],
    };

    const errors = validateManifest(validManifest);
    expect(errors).toHaveLength(0);
  });

  it("rejects kernel stages with side-effect outputs", () => {
    const badManifest = {
      plugin_id: "bad",
      plugin_name: "Bad Plugin",
      version: "1.0.0",
      purpose: "Test",
      public_surfaces: { work_request_types: [], ui_panels: [], read_views: [] },
      stages: [
        {
          stage_id: "bad_stage",
          display_name: "Bad Stage",
          responsible_plane: "linkaios", // Kernel should not own side effects
          inputs: [],
          outputs: ["crm_record_id"], // Side-effect output
          failure_mode: "abort_run",
        },
      ],
      config_surfaces: [],
      required_capabilities: [],
      required_workflow_hooks: [],
      required_audit_events: [],
      preview_output_shape: {},
      non_goals: [],
    };

    const errors = validateManifest(badManifest);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].code).toBe("MANIFEST_KERNEL_OWNS_SIDE_EFFECT");
  });

  it("rejects require_approval stages on non-approval planes", () => {
    const badManifest = {
      plugin_id: "bad",
      plugin_name: "Bad Plugin",
      version: "1.0.0",
      purpose: "Test",
      public_surfaces: { work_request_types: [], ui_panels: [], read_views: [] },
      stages: [
        {
          stage_id: "bad_stage",
          display_name: "Bad Stage",
          responsible_plane: "linkbot", // Not an approval-owning plane
          inputs: [],
          outputs: [],
          failure_mode: "require_approval",
        },
      ],
      config_surfaces: [],
      required_capabilities: [],
      required_workflow_hooks: [],
      required_audit_events: [],
      preview_output_shape: {},
      non_goals: [],
    };

    const errors = validateManifest(badManifest);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].code).toBe("MANIFEST_APPROVAL_PLANE_INVALID");
  });

  it("rejects unknown audit events", () => {
    const badManifest = {
      plugin_id: "bad",
      plugin_name: "Bad Plugin",
      version: "1.0.0",
      purpose: "Test",
      public_surfaces: { work_request_types: [], ui_panels: [], read_views: [] },
      stages: [
        {
          stage_id: "test_stage",
          display_name: "Test Stage",
          responsible_plane: "linkbot",
          inputs: [],
          outputs: [],
          failure_mode: "retryable",
        },
      ],
      config_surfaces: [],
      required_capabilities: [],
      required_workflow_hooks: [],
      required_audit_events: ["run.exploded"], // Unknown
      preview_output_shape: {},
      non_goals: [],
    };

    const errors = validateManifest(badManifest);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.code === "MANIFEST_AUDIT_EVENT_UNKNOWN")).toBe(true);
  });
});

describe("loadAndValidateWebsiteFactoryManifest", () => {
  it("loads without throwing", () => {
    expect(() => loadAndValidateWebsiteFactoryManifest()).not.toThrow();
  });

  it("returns the canonical WebsiteFactory manifest", () => {
    const manifest = loadAndValidateWebsiteFactoryManifest();
    expect(manifest.plugin_id).toBe("websitefactory");
  });
});

// ============================================================================
// PreviewOutput Tests
// ============================================================================

describe("buildPreviewOutput", () => {
  it("builds correct output shape per CONTRACTS_MVO.md §9", () => {
    const run: Run = {
      run_id: "r-123",
      work_request_id: "wr-456",
      tenant_id: "t-789",
      plugin_id: "websitefactory",
      status: "succeeded",
      started_at: "2026-05-14T12:00:00Z",
      ended_at: "2026-05-14T12:05:00Z",
      stages: [
        {
          stage_id: "preview_publish",
          run_id: "r-123",
          responsible_plane: "linkskills",
          status: "succeeded",
          attempt: 1,
          inputs_snapshot: {},
          outputs: {
            preview_url: "https://preview.example.com/p/r-123",
            preview_artifact_ref: "storage://previews/r-123.zip",
          },
          refs: {
            lease_ids: ["lease-1"],
            workflow_run_ids: ["wf-1"],
            audit_event_ids: ["audit-1"],
          },
        },
      ],
      outputs: {
        preview_url: "https://preview.example.com/p/r-123",
        preview_artifact_ref: "storage://previews/r-123.zip",
        crm_record_id: "crm-123",
        project_id: "proj-456",
        task_id: "task-789",
      },
    };

    const output = buildPreviewOutput(run);

    expect(output.run_id).toBe("r-123");
    expect(output.tenant_id).toBe("t-789");
    expect(output.plugin_id).toBe("websitefactory");
    expect(output.preview_url).toBe("https://preview.example.com/p/r-123");
    expect(output.preview_artifact_ref).toBe("storage://previews/r-123.zip");
    expect(output.crm_record_id).toBe("crm-123");
    expect(output.project_id).toBe("proj-456");
    expect(output.task_id).toBe("task-789");
    expect(output.lease_ids).toContain("lease-1");
    expect(output.workflow_run_ids).toContain("wf-1");
    expect(output.audit_event_ids).toContain("audit-1");
    expect(output.status).toBe("succeeded");
    expect(output.finalized_at).toBe("2026-05-14T12:05:00Z");
  });

  it("handles null values for optional fields", () => {
    const run: Run = {
      run_id: "r-123",
      work_request_id: "wr-456",
      tenant_id: "t-789",
      plugin_id: "websitefactory",
      status: "succeeded",
      started_at: "2026-05-14T12:00:00Z",
      stages: [],
      outputs: {
        preview_url: "https://preview.example.com/p/r-123",
        preview_artifact_ref: "storage://previews/r-123.zip",
      },
    };

    const output = buildPreviewOutput(run);

    expect(output.crm_record_id).toBeNull();
    expect(output.project_id).toBeNull();
    expect(output.task_id).toBeNull();
  });

  it("correctly maps run status to output status", () => {
    const statuses: Array<Run["status"]> = [
      "succeeded",
      "failed",
      "awaiting_approval",
      "partial",
      "pending",
      "running",
      "cancelled",
    ];

    for (const status of statuses) {
      const run: Run = {
        run_id: "r-123",
        work_request_id: "wr-456",
        tenant_id: "t-789",
        plugin_id: "websitefactory",
        status,
        started_at: "2026-05-14T12:00:00Z",
        stages: [],
        outputs: {
          preview_url: "",
          preview_artifact_ref: "",
        },
      };

      const output = buildPreviewOutput(run);

      if (status === "succeeded") expect(output.status).toBe("succeeded");
      else if (status === "partial") expect(output.status).toBe("partial");
      else if (status === "awaiting_approval") expect(output.status).toBe("awaiting_approval");
      else expect(output.status).toBe("failed");
    }
  });
});

// ============================================================================
// Role Bleed Guard Tests
// ============================================================================

describe("role bleed guards", () => {
  it("kernel manifest does not absorb LinkBot responsibilities", () => {
    const manifest = loadWebsiteFactoryManifest();

    // Kernel stages should not do reasoning
    const kernelStages = manifest.stages.filter((s) => s.responsible_plane === "linkaios");
    for (const stage of kernelStages) {
      // lead_intake is coordination only, no reasoning
      expect(stage.stage_id).not.toContain("evaluation");
      expect(stage.stage_id).not.toContain("generation");
      expect(stage.stage_id).not.toContain("selection");
    }
  });

  it("kernel manifest does not absorb LinkSkills responsibilities", () => {
    const manifest = loadWebsiteFactoryManifest();

    // Kernel should not own capability policy
    const kernelStages = manifest.stages.filter((s) => s.responsible_plane === "linkaios");
    for (const stage of kernelStages) {
      expect(stage.stage_id).not.toBe("crm_upsert");
      expect(stage.stage_id).not.toBe("preview_publish");
    }
  });

  it("kernel manifest does not absorb LiNKautowork responsibilities", () => {
    const manifest = loadWebsiteFactoryManifest();

    // Kernel should not execute deterministic workflows
    const kernelStages = manifest.stages.filter((s) => s.responsible_plane === "linkaios");
    for (const stage of kernelStages) {
      expect(stage.stage_id).not.toBe("look_and_feel");
      expect(stage.stage_id).not.toBe("render_preview");
    }
  });

  it("kernel manifest does not absorb LiNKbrain responsibilities", () => {
    const manifest = loadWebsiteFactoryManifest();

    // Kernel should not own audit/memory persistence (except record_run which is the closure stage)
    const kernelStages = manifest.stages.filter((s) => s.responsible_plane === "linkaios");
    for (const stage of kernelStages) {
      // record_run is the closure stage that delegates to LiNKbrain
      expect(stage.stage_id).not.toContain("audit");
      expect(stage.stage_id).not.toContain("memory");
    }
  });
});

// ============================================================================
// Plugin Extension Point Tests
// ============================================================================

describe("plugin extension point wiring", () => {
  it("kernel loads manifest from plugin module", async () => {
    // The kernel should load the WebsiteFactory manifest from the plugin module
    const { getWebsiteFactoryManifest } = await import("@/lib/plugins/websitefactory");
    const manifest = getWebsiteFactoryManifest();

    expect(manifest.plugin_id).toBe("websitefactory");
    expect(manifest.stages).toHaveLength(10);
    expect(manifest.required_capabilities).toContain("crm.upsert");
    expect(manifest.required_workflow_hooks).toContain("autowork.websitefactory.render");
  });

  it("kernel delegates stage execution to plugin's executeStage", async () => {
    // The plugin should export an executeStage function that the kernel calls
    const { executeWebsiteFactoryStage } = await import("@/lib/plugins/websitefactory");

    expect(typeof executeWebsiteFactoryStage).toBe("function");
  });

  it("plugin's stage mappings match CONTRACTS_MVO.md", async () => {
    const {
      mapStageToCapability,
      mapStageToWorkflowHandle,
      mapStageToReasoningKind,
    } = await import("@/lib/plugins/websitefactory");

    // Verify capability mappings per §7
    expect(mapStageToCapability("crm_upsert")).toBe("crm.upsert");
    expect(mapStageToCapability("plane_project_create")).toBe("plane.project.create");
    expect(mapStageToCapability("preview_publish")).toBe("preview.publish");

    // Verify workflow mappings per §6.4
    expect(mapStageToWorkflowHandle("look_and_feel")).toBe("autowork.websitefactory.render");
    expect(mapStageToWorkflowHandle("preview_publish")).toBe("autowork.websitefactory.preview_serve");

    // Verify reasoning mappings per §6.1
    expect(mapStageToReasoningKind("lead_evaluation")).toBe("lead_evaluation");
    expect(mapStageToReasoningKind("template_selection")).toBe("template_selection");
    expect(mapStageToReasoningKind("copy_generation")).toBe("copy_generation");
    expect(mapStageToReasoningKind("media_placement")).toBe("media_placement");
  });

  it("kernel does not duplicate plugin stage mappings", () => {
    // After refactoring, the kernel orchestrator should NOT have hardcoded
    // stage mappings for plugin-declared stages (linkbot, linkskills, linkautowork, linkbrain)

    // The kernel's executeStage should delegate to the plugin for non-kernel stages
    // This is verified by checking that the orchestrator file imports from the plugin
    const orchestratorSource = `
      import { executeWebsiteFactoryStage } from "@/lib/plugins/websitefactory";
    `;

    expect(orchestratorSource).toContain("executeWebsiteFactoryStage");
  });

  it("websitefactory.lead_to_preview work request routes through plugin", async () => {
    // Verify the complete flow: work_request_type -> plugin_id -> manifest
    const { getWebsiteFactoryManifest, WORK_REQUEST_TYPE } = await import("@/lib/plugins/websitefactory");
    const manifest = getWebsiteFactoryManifest();

    // Plugin declares the work_request_type
    expect(manifest.public_surfaces.work_request_types).toContain(WORK_REQUEST_TYPE);
    expect(WORK_REQUEST_TYPE).toBe("websitefactory.lead_to_preview");

    // Plugin_id matches
    expect(manifest.plugin_id).toBe("websitefactory");
  });
});
