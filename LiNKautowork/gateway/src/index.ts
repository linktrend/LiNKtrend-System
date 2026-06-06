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
  checkN8nHealth,
  setN8nClientForTesting,
  setIdempotencyStoreForTesting,
} from "./lib/workflow-runner.js";

export {
  // Workflow status read model (WP-217)
  workflowStatusQuery,
  recordWorkflowRun,
  updateWorkflowRun,
  buildRunView,
  clearWorkflowStatusStore,
  type WorkflowRunView,
  type WorkflowStatusQuery,
} from "./lib/workflow-status.js";

export {
  // Audit emitter
  createAuditEmitter,
  type AuditEmitter,
} from "./lib/audit-emitter.js";

export {
  // Health primitives
  createHealthCheck,
  type HealthCheck,
  type HealthCheckResult,
  type HealthCheckDependencyResult,
  type HealthStatus,
} from "./lib/health.js";

export {
  // Metrics primitives
  MetricsCollector,
  type InvocationStatus,
} from "./lib/metrics.js";

export {
  getRunController,
  getMutableRunControllerForTesting,
  type RunController,
  type QueueStatus,
} from "./lib/run-controller.js";

export {
  // WebsiteFactory workflow bootstrap
  bootstrapWebsiteFactoryWorkflows,
  bootstrapLinkdeveloperWorkflows,
  WEBSITE_FACTORY_RENDER_HANDLE,
  WEBSITE_FACTORY_RENDER_DISPLAY_NAME,
  WEBSITE_FACTORY_SERVE_HANDLE,
  WEBSITE_FACTORY_SERVE_DISPLAY_NAME,
  LINKSITES_ARTIFACT_WRITE_LOCAL_HANDLE,
  LINKSITES_SUPABASE_MIRROR_UPSERT_HANDLE,
  LINKSITES_PAYLOAD_SYNC_LOCAL_HANDLE,
  LINKSITES_PREVIEW_READINESS_CHECK_HANDLE,
  LINKSITES_CRM_READY_TO_CONTACT_MARK_HANDLE,
  // Store accessors (for testing/integration)
  getRenderedArtifact,
  renderArtifactStore,
  getServedPreview,
  listServedPreviews,
  getPreviewHtml,
  previewServedRoutes,
  clearLinksitesStores,
  LINKDEVELOPER_PRODUCT_RUN_BOOTSTRAP_HANDLE,
  LINKDEVELOPER_ISSUE_DISPATCH_HANDLE,
  LINKDEVELOPER_VALIDATION_RECORD_HANDLE,
  LINKDEVELOPER_ARTIFACT_WRITE_HANDLE,
  getProductRunBootstrap,
  getLinkdeveloperWorkflowMapHandles,
  clearLinkdeveloperStores,
} from "./workflows/index.js";

export {
  N8nHttpClient,
  type N8nClient,
} from "./lib/n8n-client.js";

export {
  N8nWebhookRegistry,
  type N8nWebhookPayload,
} from "./lib/n8n-webhook-handler.js";

export {
  SAMPLE_N8N_WORKFLOW_TEMPLATE,
  executeViaN8n,
} from "./workflows/n8n-executor.js";

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
