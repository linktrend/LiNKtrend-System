import { describe, expect, it, beforeEach } from "vitest";
import type {
  WorkflowInvokeRequest,
  RenderSpec,
  AuditEvent,
} from "@linktrend/linklogic-sdk";
import {
  bootstrapWebsiteFactoryWorkflows,
  invokeWorkflow,
  clearIdempotencyCache,
  clearWorkflowRegistry,
  listRegisteredWorkflows,
  getRenderedArtifact,
  getServedPreview,
  getPreviewHtml,
  renderArtifactStore,
  previewServedRoutes,
  WEBSITE_FACTORY_RENDER_HANDLE,
  WEBSITE_FACTORY_SERVE_HANDLE,
} from "../index.js";

// Mock audit event writer that collects events in memory
function createMockAuditWriter() {
  const events: AuditEvent[] = [];
  return {
    write: async (event: AuditEvent) => {
      events.push(event);
      return { event_id: event.event_id };
    },
    getEvents: () => events,
    clear: () => events.length = 0,
  };
}

// Sample RenderSpec for testing
const sampleRenderSpec: RenderSpec = {
  template_id: "web-master-default",
  copy_bundle: {
    blocks: [
      {
        block_id: "hero",
        text: {
          headline: "Welcome to Your Business",
          subheadline: "We help you grow",
        },
      },
      {
        block_id: "features",
        text: {
          feature_1: "Feature One Description",
          feature_2: "Feature Two Description",
        },
      },
    ],
    locale: "en-US",
  },
  media_plan: {
    placements: [
      { block_id: "hero", asset_ref: "hero-bg.jpg", kind: "placeholder" },
      { block_id: "features", asset_ref: "feature-icon.svg", kind: "stock" },
    ],
  },
  theme: {
    primary_color: "#3b82f6",
    font_family: "system-ui",
  },
};

describe("LiNKautowork WebsiteFactory Workflows", () => {
  let auditWriter: ReturnType<typeof createMockAuditWriter>;

  beforeEach(() => {
    auditWriter = createMockAuditWriter();
    clearIdempotencyCache();
    clearWorkflowRegistry();
    auditWriter.clear();
    // Clear stores
    renderArtifactStore.clear();
    previewServedRoutes.clear();
    // Bootstrap workflows
    bootstrapWebsiteFactoryWorkflows({
      writeAuditEvent: auditWriter.write,
      preview_route_prefix: "/preview",
    });
  });

  describe("autowork.websitefactory.render", () => {
    it("should render a preview artifact and emit workflow.invoked + workflow.completed", async () => {
      const request: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "look_and_feel",
        workflow_handle: WEBSITE_FACTORY_RENDER_HANDLE,
        inputs: {
          render_spec: sampleRenderSpec,
        },
        lease_id: undefined, // render does not require lease
        idempotency_key: "test-render-1",
      };

      const result = await invokeWorkflow(request, {
        writeAuditEvent: auditWriter.write,
      });

      // Assert success
      expect(result.status).toBe("succeeded");
      expect(result.workflow_run_id).toBeDefined();
      expect(result.outputs).toBeDefined();
      expect(result.outputs?.preview_artifact_ref).toMatch(/^artifact:/);
      expect(result.audit_event_ids).toHaveLength(2);

      // Assert audit events
      const events = auditWriter.getEvents();
      expect(events).toHaveLength(2);
      expect(events[0].action).toBe("workflow.invoked");
      expect(events[0].subject.run_id).toBe("run-456");
      expect(events[0].subject.stage_id).toBe("look_and_feel");
      expect(events[1].action).toBe("workflow.completed");
      expect(events[1].subject.preview_artifact_ref).toBe(result.outputs?.preview_artifact_ref);
      expect(events[1].refs?.parent_event_id).toBe(events[0].event_id);

      // Assert artifact was stored
      const artifactRef = result.outputs?.preview_artifact_ref as string;
      const artifact = getRenderedArtifact(artifactRef);
      expect(artifact).toBeDefined();
      expect(artifact?.template_id).toBe("web-master-default");
      expect(artifact?.html_content).toContain("Welcome to Your Business");
    });

    it("should return exact cached result for same idempotency key", async () => {
      const request: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "look_and_feel",
        workflow_handle: WEBSITE_FACTORY_RENDER_HANDLE,
        inputs: {
          render_spec: sampleRenderSpec,
        },
        idempotency_key: "test-idempotent",
      };

      const result1 = await invokeWorkflow(request, {
        writeAuditEvent: auditWriter.write,
      });

      const result2 = await invokeWorkflow(request, {
        writeAuditEvent: auditWriter.write,
      });

      // Same outputs
      expect(result1.outputs?.preview_artifact_ref).toBe(result2.outputs?.preview_artifact_ref);
      // Same workflow_run_id (exact cached result per idempotency contract)
      expect(result1.workflow_run_id).toBe(result2.workflow_run_id);
      // Same audit_event_ids
      expect(result1.audit_event_ids).toEqual(result2.audit_event_ids);
    });

    it("should fail with missing render_spec and include audit_event_ids", async () => {
      const request: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "look_and_feel",
        workflow_handle: WEBSITE_FACTORY_RENDER_HANDLE,
        inputs: {},
        idempotency_key: "test-render-missing-spec",
      };

      const result = await invokeWorkflow(request, {
        writeAuditEvent: auditWriter.write,
      });

      expect(result.status).toBe("failed");
      expect(result.failure?.code).toBe("WORKFLOW_STEP_FAILED");
      expect(result.failure?.message).toContain("render_spec");
      // Must include workflow.invoked + workflow.failed audit event IDs
      expect(result.audit_event_ids).toHaveLength(2);

      // Verify audit events
      const events = auditWriter.getEvents();
      const invokedEvent = events.find(e => e.action === "workflow.invoked");
      const failedEvent = events.find(e => e.action === "workflow.failed");
      expect(invokedEvent).toBeDefined();
      expect(failedEvent).toBeDefined();
      expect(result.audit_event_ids).toContain(invokedEvent!.event_id);
      expect(result.audit_event_ids).toContain(failedEvent!.event_id);
    });

    it("should include render stats in outputs", async () => {
      const request: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "look_and_feel",
        workflow_handle: WEBSITE_FACTORY_RENDER_HANDLE,
        inputs: {
          render_spec: sampleRenderSpec,
        },
        idempotency_key: "test-render-stats",
      };

      const result = await invokeWorkflow(request, {
        writeAuditEvent: auditWriter.write,
      });

      expect(result.status).toBe("succeeded");
      const stats = result.outputs?.render_stats as Record<string, unknown>;
      expect(stats).toBeDefined();
      expect(stats.template_id).toBe("web-master-default");
      expect(stats.blocks_rendered).toBe(2);
      expect(stats.media_placements).toBe(2);
      expect(stats.render_duration_ms).toBeGreaterThanOrEqual(0);
    });
  });

  describe("autowork.websitefactory.preview_serve", () => {
    it("should require a lease_id and include audit_event_ids", async () => {
      const request: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "preview_publish",
        workflow_handle: WEBSITE_FACTORY_SERVE_HANDLE,
        inputs: {
          preview_artifact_ref: "artifact:test",
        },
        idempotency_key: "test-serve-no-lease",
      };

      const result = await invokeWorkflow(request, {
        writeAuditEvent: auditWriter.write,
      });

      expect(result.status).toBe("failed");
      expect(result.failure?.code).toBe("LEASE_REQUEST_INVALID");
      // Must include workflow.invoked + workflow.failed audit event IDs
      expect(result.audit_event_ids).toHaveLength(2);

      // Verify audit events
      const events = auditWriter.getEvents();
      const invokedEvent = events.find(e => e.action === "workflow.invoked");
      const failedEvent = events.find(e => e.action === "workflow.failed");
      expect(invokedEvent).toBeDefined();
      expect(failedEvent).toBeDefined();
      expect(result.audit_event_ids).toContain(invokedEvent!.event_id);
      expect(result.audit_event_ids).toContain(failedEvent!.event_id);
    });

    it("should serve a rendered artifact and return preview_url with preview_artifact_ref", async () => {
      // First, render an artifact
      const renderRequest: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "look_and_feel",
        workflow_handle: WEBSITE_FACTORY_RENDER_HANDLE,
        inputs: {
          render_spec: sampleRenderSpec,
        },
        idempotency_key: "test-render-for-serve",
      };

      const renderResult = await invokeWorkflow(renderRequest, {
        writeAuditEvent: auditWriter.write,
      });

      const artifactRef = renderResult.outputs?.preview_artifact_ref as string;

      // Now serve it
      const serveRequest: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "preview_publish",
        workflow_handle: WEBSITE_FACTORY_SERVE_HANDLE,
        inputs: {
          preview_artifact_ref: artifactRef,
        },
        lease_id: "lease-789",
        idempotency_key: "test-serve-1",
      };

      const serveResult = await invokeWorkflow(serveRequest, {
        writeAuditEvent: auditWriter.write,
      });

      expect(serveResult.status).toBe("succeeded");
      expect(serveResult.outputs?.preview_url).toMatch(/^\/preview\/tenant-123\/run-456/);
      expect(serveResult.outputs?.preview_artifact_ref).toBe(artifactRef);
      expect(serveResult.outputs?.serve_route).toBeDefined();
      expect(serveResult.outputs?.expires_at).toBeDefined();
      expect(serveResult.audit_event_ids).toHaveLength(2);

      // Verify audit events
      const events = auditWriter.getEvents();
      const serveEvents = events.filter(e =>
        e.subject.workflow_run_id === serveResult.workflow_run_id
      );
      expect(serveEvents).toHaveLength(2);
      expect(serveEvents[0].action).toBe("workflow.invoked");
      expect(serveEvents[0].subject.lease_id).toBe("lease-789");
      expect(serveEvents[1].action).toBe("workflow.completed");
      expect(serveEvents[1].subject.preview_url).toBe(serveResult.outputs?.preview_url);
      expect(serveEvents[1].subject.preview_artifact_ref).toBe(artifactRef);
    });

    it("should fail when artifact does not exist and include audit_event_ids", async () => {
      const serveRequest: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "preview_publish",
        workflow_handle: WEBSITE_FACTORY_SERVE_HANDLE,
        inputs: {
          preview_artifact_ref: "artifact:nonexistent",
        },
        lease_id: "lease-789",
        idempotency_key: "test-serve-missing-artifact",
      };

      const serveResult = await invokeWorkflow(serveRequest, {
        writeAuditEvent: auditWriter.write,
      });

      expect(serveResult.status).toBe("failed");
      expect(serveResult.failure?.code).toBe("WORKFLOW_STEP_FAILED");
      expect(serveResult.failure?.message).toContain("not found");
      // Must include workflow.invoked + workflow.failed (+ workflow.compensated) audit event IDs
      expect(serveResult.audit_event_ids.length).toBeGreaterThanOrEqual(2);

      // Verify audit events
      const events = auditWriter.getEvents();
      const invokedEvent = events.find(e => e.action === "workflow.invoked");
      const failedEvent = events.find(e => e.action === "workflow.failed");
      expect(invokedEvent).toBeDefined();
      expect(failedEvent).toBeDefined();
      expect(serveResult.audit_event_ids).toContain(invokedEvent!.event_id);
      expect(serveResult.audit_event_ids).toContain(failedEvent!.event_id);
    });

    it("should allow retrieving HTML content for a served preview", async () => {
      // Render and serve
      const renderRequest: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-789",
        stage_id: "look_and_feel",
        workflow_handle: WEBSITE_FACTORY_RENDER_HANDLE,
        inputs: {
          render_spec: sampleRenderSpec,
        },
        idempotency_key: "test-render-for-html",
      };

      const renderResult = await invokeWorkflow(renderRequest, {
        writeAuditEvent: auditWriter.write,
      });

      const artifactRef = renderResult.outputs?.preview_artifact_ref as string;

      const serveRequest: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-789",
        stage_id: "preview_publish",
        workflow_handle: WEBSITE_FACTORY_SERVE_HANDLE,
        inputs: {
          preview_artifact_ref: artifactRef,
        },
        lease_id: "lease-999",
        idempotency_key: "test-serve-for-html",
      };

      await invokeWorkflow(serveRequest, {
        writeAuditEvent: auditWriter.write,
      });

      // Get the HTML
      const route = "/preview/tenant-123/run-789";
      const html = getPreviewHtml(route);
      expect(html).toBeDefined();
      expect(html).toContain("Welcome to Your Business");
      expect(html).toContain("web-master-default");
    });
  });

  describe("workflow runner", () => {
    it("should return error for unregistered workflow", async () => {
      const request: WorkflowInvokeRequest = {
        tenant_id: "tenant-123",
        run_id: "run-456",
        stage_id: "test",
        workflow_handle: "autowork.nonexistent.workflow",
        inputs: {},
        idempotency_key: "test-unknown",
      };

      const result = await invokeWorkflow(request, {
        writeAuditEvent: auditWriter.write,
      });

      expect(result.status).toBe("failed");
      expect(result.failure?.code).toBe("WORKFLOW_NOT_FOUND");
    });

    it("should list registered workflows after bootstrap", () => {
      const workflows = listRegisteredWorkflows();
      expect(workflows).toContain(WEBSITE_FACTORY_RENDER_HANDLE);
      expect(workflows).toContain(WEBSITE_FACTORY_SERVE_HANDLE);
    });
  });
});
