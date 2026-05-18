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
import {
  createArtifactWriteLocalHandler,
  createSupabaseMirrorUpsertHandler,
  createPayloadSyncLocalHandler,
  createPreviewReadinessCheckHandler,
  createCrmReadyToContactMarkHandler,
  ARTIFACT_WRITE_LOCAL_HANDLE,
  SUPABASE_MIRROR_UPSERT_HANDLE,
  PAYLOAD_SYNC_LOCAL_HANDLE,
  PREVIEW_READINESS_CHECK_HANDLE,
  CRM_READY_TO_CONTACT_MARK_HANDLE,
} from "./linksites-v2.js";
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

// Re-export LiNKapps workflow pack
export {
  CREATE_REPO_HANDLE,
  PROVISION_SERVICES_HANDLE,
  BUILD_ITERATION_HANDLE,
  RELEASE_READINESS_HANDLE,
  DEPLOY_HANDLE,
  COMPILE_HANDOFF_HANDLE,
  createRepoHandler,
  createProvisionServicesHandler,
  createBuildIterationHandler,
  createReleaseReadinessHandler,
  createDeployHandler,
  createCompileHandoffHandler,
  getRepo,
  getService,
  getBuild,
  getValidation,
  getDeploy,
  getHandoff,
  clearLinkappsStores,
} from "./linkapps.js";
