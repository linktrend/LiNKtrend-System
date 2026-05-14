/**
 * Workflow registry bootstrap for LiNKautowork Gateway.
 *
 * Registers all MVO workflow handles:
 * - autowork.websitefactory.render
 * - autowork.websitefactory.preview_serve
 */

import { registerWorkflow } from "../lib/workflow-runner.js";
import { createAuditEmitter } from "../lib/audit-emitter.js";
import {
  createRenderWorkflowHandler,
  WORKFLOW_HANDLE as RENDER_HANDLE,
  WORKFLOW_DISPLAY_NAME as RENDER_DISPLAY_NAME,
  WORKFLOW_DESCRIPTION as RENDER_DESCRIPTION,
} from "./websitefactory-render.js";
import {
  createPreviewServeWorkflowHandler,
  WORKFLOW_HANDLE as SERVE_HANDLE,
  WORKFLOW_DISPLAY_NAME as SERVE_DISPLAY_NAME,
  WORKFLOW_DESCRIPTION as SERVE_DESCRIPTION,
} from "./websitefactory-preview-serve.js";
import type { AuditEvent } from "@linktrend/linklogic-sdk";

/**
 * Bootstrap all WebsiteFactory workflows.
 *
 * @param deps.writeAuditEvent - Function to write audit events to LiNKbrain
 * @param deps.preview_route_prefix - Optional override for preview URL prefix
 */
export function bootstrapWebsiteFactoryWorkflows(deps: {
  writeAuditEvent: (event: AuditEvent) => Promise<{ event_id: string }>;
  preview_route_prefix?: string;
}): void {
  const auditEmitter = createAuditEmitter(deps.writeAuditEvent);

  // Register autowork.websitefactory.render
  registerWorkflow({
    handle: RENDER_HANDLE,
    display_name: RENDER_DISPLAY_NAME,
    description: RENDER_DESCRIPTION,
    requires_lease: false, // render is not side-effecting
    handler: createRenderWorkflowHandler(auditEmitter),
  });

  // Register autowork.websitefactory.preview_serve
  registerWorkflow({
    handle: SERVE_HANDLE,
    display_name: SERVE_DISPLAY_NAME,
    description: SERVE_DESCRIPTION,
    requires_lease: true, // preview_serve requires lease for side-effect gating
    handler: createPreviewServeWorkflowHandler(auditEmitter, {
      preview_route_prefix: deps.preview_route_prefix,
    }),
  });
}

export {
  RENDER_HANDLE as WEBSITE_FACTORY_RENDER_HANDLE,
  RENDER_DISPLAY_NAME as WEBSITE_FACTORY_RENDER_DISPLAY_NAME,
  SERVE_HANDLE as WEBSITE_FACTORY_SERVE_HANDLE,
  SERVE_DISPLAY_NAME as WEBSITE_FACTORY_SERVE_DISPLAY_NAME,
};

// Re-export workflow-specific getters for integration testing
export {
  getRenderedArtifact,
  artifactStore as renderArtifactStore,
} from "./websitefactory-render.js";

export {
  getServedPreview,
  listServedPreviews,
  getPreviewHtml,
  servedRoutes as previewServedRoutes,
} from "./websitefactory-preview-serve.js";
