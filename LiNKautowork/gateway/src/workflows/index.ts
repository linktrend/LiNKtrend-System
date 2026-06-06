/**
 * Workflow registry bootstrap for LiNKautowork Gateway.
 *
 * Registers all MVO workflow handles:
 * - autowork.websitefactory.render
 * - autowork.websitefactory.preview_serve
 * - autowork.linksites.* (LinkSites v2 workflows)
 * - autowork.lexos.* (LEXOS litigation workflows)
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
import {
  createArtifactWriteLocalHandler,
  createSupabaseMirrorUpsertHandler,
  createPayloadSyncLocalHandler,
  createPreviewReadinessCheckHandler,
  createCrmReadyToContactMarkHandler,
  createOutreachDispatchHandler,
  ARTIFACT_WRITE_LOCAL_HANDLE,
  SUPABASE_MIRROR_UPSERT_HANDLE,
  PAYLOAD_SYNC_LOCAL_HANDLE,
  PREVIEW_READINESS_CHECK_HANDLE,
  CRM_READY_TO_CONTACT_MARK_HANDLE,
  OUTREACH_DISPATCH_HANDLE,
} from "./linksites-v2.js";
import {
  createEvidenceIngestHandler,
  createExtractionRunHandler,
  createAssertionSyncHandler,
  createArtifactGenerateHandler,
  createCrmSyncHandler,
  EVIDENCE_INGEST_HANDLE,
  EXTRACTION_RUN_HANDLE,
  ASSERTION_SYNC_HANDLE,
  ARTIFACT_GENERATE_HANDLE,
  CRM_SYNC_HANDLE,
} from "./lexos.js";
import type { AuditEvent } from "@linktrend/linklogic-sdk";
import {
  createRepoHandler,
  provisionServicesHandler,
  buildIterationHandler,
  releaseReadinessHandler,
  deployHandler,
  compileHandoffHandler,
  CREATE_REPO_HANDLE,
  PROVISION_SERVICES_HANDLE,
  BUILD_ITERATION_HANDLE,
  RELEASE_READINESS_HANDLE,
  DEPLOY_HANDLE,
  COMPILE_HANDOFF_HANDLE,
} from "./linkapps.js";

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

  registerWorkflow({
    handle: ARTIFACT_WRITE_LOCAL_HANDLE,
    display_name: "LinkSites Artifact Write Local",
    description: "Write generated LinkSites artifacts to a local development-only folder",
    requires_lease: false,
    handler: createArtifactWriteLocalHandler(auditEmitter),
  });

  registerWorkflow({
    handle: SUPABASE_MIRROR_UPSERT_HANDLE,
    display_name: "LinkSites Supabase Mirror Upsert",
    description: "Upsert LinkSites mirror records in development mode",
    requires_lease: true,
    handler: createSupabaseMirrorUpsertHandler(auditEmitter),
  });

  registerWorkflow({
    handle: PAYLOAD_SYNC_LOCAL_HANDLE,
    display_name: "LinkSites Payload Sync Local",
    description: "Sync LinkSites mirror-backed content to local Payload for preview",
    requires_lease: true,
    handler: createPayloadSyncLocalHandler(auditEmitter),
  });

  registerWorkflow({
    handle: PREVIEW_READINESS_CHECK_HANDLE,
    display_name: "LinkSites Preview Readiness Check",
    description: "Run deterministic preview readiness checks for LinkSites",
    requires_lease: false,
    handler: createPreviewReadinessCheckHandler(auditEmitter),
  });

  registerWorkflow({
    handle: CRM_READY_TO_CONTACT_MARK_HANDLE,
    display_name: "LinkSites CRM Ready To Contact Mark",
    description: "Mark CRM lead ready_to_contact after deterministic checks pass",
    requires_lease: true,
    handler: createCrmReadyToContactMarkHandler(auditEmitter),
  });

  registerWorkflow({
    handle: OUTREACH_DISPATCH_HANDLE,
    display_name: "LinkSites Outreach Dispatch",
    description: "Governed outreach send after Principal approval (lease + audit)",
    requires_lease: true,
    handler: createOutreachDispatchHandler(auditEmitter),
  });

  // Register LiNKapps workflow pack (Phase 5 stages)
  registerWorkflow({
    handle: CREATE_REPO_HANDLE,
    display_name: "LiNKapps Create Repository",
    description: "Stage 5.2: Generate app repository from template (mock mode only)",
    requires_lease: true,
    handler: createRepoHandler(auditEmitter),
  });

  registerWorkflow({
    handle: PROVISION_SERVICES_HANDLE,
    display_name: "LiNKapps Provision Services",
    description: "Stage 5.3: Provision Supabase, Stripe services (mock mode only)",
    requires_lease: true,
    handler: provisionServicesHandler(auditEmitter),
  });

  registerWorkflow({
    handle: BUILD_ITERATION_HANDLE,
    display_name: "LiNKapps Build Iteration",
    description: "Stage 5.4: AI implementation iteration (deterministic, no lease required)",
    requires_lease: false,
    handler: buildIterationHandler(auditEmitter),
  });

  registerWorkflow({
    handle: RELEASE_READINESS_HANDLE,
    display_name: "LiNKapps Release Readiness",
    description: "Stage 5.5: Quality validation and release readiness check",
    requires_lease: true,
    handler: releaseReadinessHandler(auditEmitter),
  });

  registerWorkflow({
    handle: DEPLOY_HANDLE,
    display_name: "LiNKapps Deploy",
    description: "Stage 5.6: Deploy to preview environment (mock mode only)",
    requires_lease: true,
    handler: deployHandler(auditEmitter),
  });

  registerWorkflow({
    handle: COMPILE_HANDOFF_HANDLE,
    display_name: "LiNKapps Compile Handoff",
    description: "Stage 5.7: Compile spinoff handoff package",
    requires_lease: true,
    handler: compileHandoffHandler(auditEmitter),
  });
}

/**
 * Bootstrap all LEXOS litigation workflows.
 *
 * Per WP-105 and LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md §4.
 *
 * @param deps.writeAuditEvent - Function to write audit events to LiNKbrain
 */
export function bootstrapLexosWorkflows(deps: {
  writeAuditEvent: (event: AuditEvent) => Promise<{ event_id: string }>;
}): void {
  const auditEmitter = createAuditEmitter(deps.writeAuditEvent);

  // Register autowork.lexos.evidence_ingest (W4)
  registerWorkflow({
    handle: EVIDENCE_INGEST_HANDLE,
    display_name: "LEXOS Evidence Ingest",
    description: "Ingest evidence files and trigger extraction pipeline (W4)",
    requires_lease: true, // Side-effecting: storage writes
    handler: createEvidenceIngestHandler(auditEmitter),
  });

  // Register autowork.lexos.extraction_run (W4)
  registerWorkflow({
    handle: EXTRACTION_RUN_HANDLE,
    display_name: "LEXOS Extraction Run",
    description: "Run extraction pipeline (OCR, parser, QA) on evidence (W4)",
    requires_lease: true, // Side-effecting: processing writes
    handler: createExtractionRunHandler(auditEmitter),
  });

  // Register autowork.lexos.assertion_sync (W5)
  registerWorkflow({
    handle: ASSERTION_SYNC_HANDLE,
    display_name: "LEXOS Assertion Sync",
    description: "Sync assertion support states and build support matrix (W5)",
    requires_lease: true, // Side-effecting: database updates
    handler: createAssertionSyncHandler(auditEmitter),
  });

  // Register autowork.lexos.artifact_generate (W10/W11)
  registerWorkflow({
    handle: ARTIFACT_GENERATE_HANDLE,
    display_name: "LEXOS Artifact Generate",
    description: "Generate output artifacts (legal briefs, memos, etc.) (W10/W11)",
    requires_lease: true, // Side-effecting: artifact generation
    handler: createArtifactGenerateHandler(auditEmitter),
  });

  // Register autowork.lexos.crm_sync (W0)
  registerWorkflow({
    handle: CRM_SYNC_HANDLE,
    display_name: "LEXOS CRM Sync",
    description: "Sync client/matter records to mock CRM (W0)",
    requires_lease: true, // Side-effecting: CRM writes
    handler: createCrmSyncHandler(auditEmitter),
  });
}

/**
 * Bootstrap all MVO workflows (LinkSites + LEXOS).
 */
export function bootstrapAllWorkflows(deps: {
  writeAuditEvent: (event: AuditEvent) => Promise<{ event_id: string }>;
  preview_route_prefix?: string;
}): void {
  bootstrapWebsiteFactoryWorkflows(deps);
  bootstrapLexosWorkflows(deps);
}

export {
  RENDER_HANDLE as WEBSITE_FACTORY_RENDER_HANDLE,
  RENDER_DISPLAY_NAME as WEBSITE_FACTORY_RENDER_DISPLAY_NAME,
  SERVE_HANDLE as WEBSITE_FACTORY_SERVE_HANDLE,
  SERVE_DISPLAY_NAME as WEBSITE_FACTORY_SERVE_DISPLAY_NAME,
  ARTIFACT_WRITE_LOCAL_HANDLE as LINKSITES_ARTIFACT_WRITE_LOCAL_HANDLE,
  SUPABASE_MIRROR_UPSERT_HANDLE as LINKSITES_SUPABASE_MIRROR_UPSERT_HANDLE,
  PAYLOAD_SYNC_LOCAL_HANDLE as LINKSITES_PAYLOAD_SYNC_LOCAL_HANDLE,
  PREVIEW_READINESS_CHECK_HANDLE as LINKSITES_PREVIEW_READINESS_CHECK_HANDLE,
  CRM_READY_TO_CONTACT_MARK_HANDLE as LINKSITES_CRM_READY_TO_CONTACT_MARK_HANDLE,
  OUTREACH_DISPATCH_HANDLE as LINKSITES_OUTREACH_DISPATCH_HANDLE,
};

// LEXOS workflow handle exports
export {
  EVIDENCE_INGEST_HANDLE as LEXOS_EVIDENCE_INGEST_HANDLE,
  EXTRACTION_RUN_HANDLE as LEXOS_EXTRACTION_RUN_HANDLE,
  ASSERTION_SYNC_HANDLE as LEXOS_ASSERTION_SYNC_HANDLE,
  ARTIFACT_GENERATE_HANDLE as LEXOS_ARTIFACT_GENERATE_HANDLE,
  CRM_SYNC_HANDLE as LEXOS_CRM_SYNC_HANDLE,
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

export { clearLinksitesStores } from "./linksites-v2.js";

// LEXOS workflow getters and utilities
export {
  getEvidence,
  getExtraction,
  getAssertionSync,
  getArtifact,
  getCrmSync,
  listEvidence,
  listExtractions,
  listAssertionSyncs,
  listArtifacts,
  listCrmSyncs,
  clearLexosStores,
} from "./lexos.js";

// Re-export LiNKapps workflow handles and utilities
export {
  CREATE_REPO_HANDLE as LINKAPPS_CREATE_REPO_HANDLE,
  PROVISION_SERVICES_HANDLE as LINKAPPS_PROVISION_SERVICES_HANDLE,
  BUILD_ITERATION_HANDLE as LINKAPPS_BUILD_ITERATION_HANDLE,
  RELEASE_READINESS_HANDLE as LINKAPPS_RELEASE_READINESS_HANDLE,
  DEPLOY_HANDLE as LINKAPPS_DEPLOY_HANDLE,
  COMPILE_HANDOFF_HANDLE as LINKAPPS_COMPILE_HANDOFF_HANDLE,
  getRepoCreation,
  getServiceProvision,
  getBuildIteration,
  getReleaseReadiness,
  getDeployment,
  getHandoffPackage,
  listAllRepoCreations,
  clearLinkappsStores,
  getWorkflowHandles as getLinkappsWorkflowHandles,
} from "./linkapps.js";
