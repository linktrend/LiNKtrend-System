/**
 * autowork.websitefactory.preview_serve workflow.
 *
 * CONTRACTS_MVO.md §6.4 — Deterministic workflow that takes a
 * preview_artifact_ref and registers it for serving at a preview_url.
 *
 * Stub behavior per INT-022:
 * - Route is served from LiNKaios/linkaios-web (not Vercel/Payload).
 * - URL format: /preview/<tenant>/<run_id>/index.html
 * - Lease check: requires a LinkSkills lease_id for side-effecting publish.
 */

import type {
  WorkflowInvokeRequest,
  FailureReport,
} from "@linktrend/linklogic-sdk";
import type {
  WorkflowContext,
  WebsiteFactoryPreviewServeInputs,
  WebsiteFactoryPreviewServeOutputs,
  WorkflowHandler,
} from "../types/index.js";
import type { AuditEmitter } from "../lib/audit-emitter.js";
import { getRenderedArtifact } from "./websitefactory-render.js";

export const WORKFLOW_HANDLE = "autowork.websitefactory.preview_serve";
export const WORKFLOW_DISPLAY_NAME = "WebsiteFactory Preview Serve";
export const WORKFLOW_DESCRIPTION =
  "Serves a rendered preview artifact at a URL route";

// In-memory store for served preview routes (MVO stub)
const servedRoutes = new Map<string, ServedPreview>();

interface ServedPreview {
  route: string;
  preview_url: string;
  artifact_ref: string;
  tenant_id: string;
  run_id: string;
  created_at: string;
  expires_at?: string;
}

/**
 * Validate and extract typed inputs from the workflow request.
 */
function extractInputs(
  request: WorkflowInvokeRequest,
): { success: true; inputs: WebsiteFactoryPreviewServeInputs } | { success: false; failure: FailureReport } {
  const raw = request.inputs as {
    preview_artifact_ref?: string;
    tenant_id?: string;
    run_id?: string;
  };

  if (!raw.preview_artifact_ref || typeof raw.preview_artifact_ref !== "string") {
    return {
      success: false,
      failure: {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork",
        message: "Missing required input: preview_artifact_ref",
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  // tenant_id and run_id can come from inputs or context
  const tenantId = raw.tenant_id || request.tenant_id;
  const runId = raw.run_id || request.run_id;

  if (!tenantId || !runId) {
    return {
      success: false,
      failure: {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork",
        message: "Missing required: tenant_id and run_id (must be in inputs or request context)",
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  return {
    success: true,
    inputs: {
      preview_artifact_ref: raw.preview_artifact_ref,
      tenant_id: tenantId,
      run_id: runId,
    },
  };
}

/**
 * Compensation function: removes served route registration.
 */
async function compensateServe(route: string): Promise<void> {
  servedRoutes.delete(route);
}

/**
 * Main workflow handler for autowork.websitefactory.preview_serve.
 */
export function createPreviewServeWorkflowHandler(
  auditEmitter: AuditEmitter,
  options: {
    preview_route_prefix?: string;
    default_ttl_days?: number;
  } = {},
): WorkflowHandler<WebsiteFactoryPreviewServeInputs, WebsiteFactoryPreviewServeOutputs> {
  const routePrefix = options.preview_route_prefix ?? "/preview";
  const ttlDays = options.default_ttl_days ?? 14;

  return async (request, context) => {
    // Emit workflow.invoked
    const invokedEventId = await auditEmitter.emitInvoked(request, context.workflow_run_id);

    // Check lease_id presence for side-effecting workflows (per §12.5)
    if (!request.lease_id) {
      const failedEventId = await auditEmitter.emitFailed(
        request,
        context.workflow_run_id,
        {
          code: "LEASE_REQUEST_INVALID",
          message: "preview_serve requires a LinkSkills lease_id for side-effect gating",
          retryable: false,
        },
        invokedEventId,
      );

      return {
        failure: {
          code: "LEASE_REQUEST_INVALID",
          message: "preview_serve requires a LinkSkills lease_id for side-effect gating",
          retryable: false,
        },
        audit_event_ids: [invokedEventId, failedEventId],
        compensation: undefined,
      };
    }

    // Validate inputs
    const inputResult = extractInputs(request);
    if (!inputResult.success) {
      const failedEventId = await auditEmitter.emitFailed(
        request,
        context.workflow_run_id,
        {
          code: inputResult.failure.code,
          message: inputResult.failure.message,
          retryable: inputResult.failure.retryable,
        },
        invokedEventId,
      );

      return {
        failure: {
          code: inputResult.failure.code,
          message: inputResult.failure.message,
          retryable: inputResult.failure.retryable,
        },
        audit_event_ids: [invokedEventId, failedEventId],
        compensation: undefined,
      };
    }

    const { preview_artifact_ref, tenant_id, run_id } = inputResult.inputs;

    try {
      // Verify the artifact exists
      const artifact = getRenderedArtifact(preview_artifact_ref);
      if (!artifact) {
        throw new Error(`Artifact not found: ${preview_artifact_ref}`);
      }

      // Build the preview route and URL
      // Format: /preview/<tenant>/<run_id>/index.html
      const serveRoute = `${routePrefix}/${tenant_id}/${run_id}`;
      const previewUrl = `${serveRoute}/index.html`;

      // Calculate expiration (MVO: 14 days default)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ttlDays);

      // Register the served preview
      const served: ServedPreview = {
        route: serveRoute,
        preview_url: previewUrl,
        artifact_ref: preview_artifact_ref,
        tenant_id,
        run_id,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      };

      servedRoutes.set(serveRoute, served);

      const outputs: WebsiteFactoryPreviewServeOutputs = {
        preview_url: previewUrl,
        preview_artifact_ref: preview_artifact_ref,
        serve_route: serveRoute,
        expires_at: expiresAt.toISOString(),
      };

      // Emit workflow.completed
      const completedEventId = await auditEmitter.emitCompleted(
        request,
        context.workflow_run_id,
        outputs,
        invokedEventId,
      );

      return {
        outputs,
        audit_event_ids: [invokedEventId, completedEventId],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown serve error";

      // Compensation: remove route registration if it was created
      const serveRoute = `${routePrefix}/${tenant_id}/${run_id}`;
      await compensateServe(serveRoute);

      // Emit workflow.failed
      const failedEventId = await auditEmitter.emitFailed(
        request,
        context.workflow_run_id,
        {
          code: "WORKFLOW_STEP_FAILED",
          message: errorMessage,
          retryable: true,
        },
        invokedEventId,
      );

      // Emit workflow.compensated
      const compensatedEventId = await auditEmitter.emitCompensated(
        request,
        context.workflow_run_id,
        "Preview serve failed, route registration cleaned up",
        failedEventId,
      );

      return {
        failure: {
          code: "WORKFLOW_STEP_FAILED",
          message: errorMessage,
          retryable: true,
        },
        audit_event_ids: [invokedEventId, failedEventId, compensatedEventId],
        compensation: async () => compensateServe(serveRoute),
      };
    }
  };
}

/**
 * Retrieve a served preview by route.
 * Used by LiNKaios/linkaios-web to serve the preview content.
 */
export function getServedPreview(route: string): ServedPreview | undefined {
  return servedRoutes.get(route);
}

/**
 * List all served previews (for debugging/management).
 */
export function listServedPreviews(): ServedPreview[] {
  return Array.from(servedRoutes.values());
}

/**
 * Get the HTML content for a served preview route.
 */
export function getPreviewHtml(route: string): string | undefined {
  const served = servedRoutes.get(route);
  if (!served) return undefined;

  const artifact = getRenderedArtifact(served.artifact_ref);
  if (!artifact) return undefined;

  return artifact.html_content;
}

export { servedRoutes };
