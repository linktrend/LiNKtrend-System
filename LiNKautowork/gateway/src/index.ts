/**
 * LiNKautowork Gateway — Main Entry Point
 *
 * Deterministic workflow execution plane per CONTRACTS_MVO.md §6.4.
 *
 * Exports:
 * - Workflow invocation runner (for LiNKaios kernel)
 * - Workflow registry management
 * - WebsiteFactory workflow bootstrap
 * - Type definitions
 */

export {
  // Workflow runner
  invokeWorkflow,
  registerWorkflow,
  getWorkflow,
  listRegisteredWorkflows,
  clearIdempotencyCache,
  getCachedResult,
  clearWorkflowRegistry,
  unregisterWorkflow,
} from "./lib/workflow-runner.js";

export {
  // Audit emitter
  createAuditEmitter,
  type AuditEmitter,
} from "./lib/audit-emitter.js";

export {
  // WebsiteFactory workflow bootstrap
  bootstrapWebsiteFactoryWorkflows,
  WEBSITE_FACTORY_RENDER_HANDLE,
  WEBSITE_FACTORY_RENDER_DISPLAY_NAME,
  WEBSITE_FACTORY_SERVE_HANDLE,
  WEBSITE_FACTORY_SERVE_DISPLAY_NAME,
  // Store accessors (for testing/integration)
  getRenderedArtifact,
  renderArtifactStore,
  getServedPreview,
  listServedPreviews,
  getPreviewHtml,
  previewServedRoutes,
} from "./workflows/index.js";

export type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowHandler,
  WebsiteFactoryRenderInputs,
  WebsiteFactoryRenderOutputs,
  WebsiteFactoryPreviewServeInputs,
  WebsiteFactoryPreviewServeOutputs,
  RenderedArtifact,
} from "./types/index.js";
