/**
 * autowork.websitefactory.render workflow.
 *
 * CONTRACTS_MVO.md §6.4 — Deterministic workflow that takes a RenderSpec
 * and produces a preview_artifact_ref (rendered HTML/CSS/JS bundle).
 *
 * Stub behavior per INT-022:
 * - Bundle is stored locally (no Vercel/Payload publishing).
 * - Artifact reference is a deterministic path handle.
 * - No reasoning, no policy decisions, no capability lease checks here
 *   (lease is passed through from LinkSkills preview.publish).
 */

import { randomUUID } from "node:crypto";
import type {
  WorkflowInvokeRequest,
  RenderSpec,
  FailureReport,
} from "@linktrend/linklogic-sdk";
import type {
  WorkflowContext,
  WebsiteFactoryRenderInputs,
  WebsiteFactoryRenderOutputs,
  WorkflowHandler,
} from "../types/index.js";
import type { AuditEmitter } from "../lib/audit-emitter.js";

export const WORKFLOW_HANDLE = "autowork.websitefactory.render";
export const WORKFLOW_DISPLAY_NAME = "WebsiteFactory Render";
export const WORKFLOW_DESCRIPTION =
  "Renders a website preview bundle from template + copy + media plan";

// In-memory store for MVO stub (replaced by persistent storage post-MVO)
const artifactStore = new Map<string, RenderedArtifact>();

interface RenderedArtifact {
  artifact_ref: string;
  tenant_id: string;
  run_id: string;
  template_id: string;
  created_at: string;
  bundle_path: string;
  html_content: string;
}

/**
 * Validate and extract typed inputs from the workflow request.
 */
function extractInputs(
  request: WorkflowInvokeRequest,
): { success: true; inputs: WebsiteFactoryRenderInputs } | { success: false; failure: FailureReport } {
  const raw = request.inputs as { render_spec?: RenderSpec };

  if (!raw.render_spec || typeof raw.render_spec !== "object") {
    return {
      success: false,
      failure: {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork",
        message: "Missing required input: render_spec",
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  const spec = raw.render_spec;

  // Validate required RenderSpec fields
  if (!spec.template_id || typeof spec.template_id !== "string") {
    return {
      success: false,
      failure: {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork",
        message: "Invalid render_spec: template_id required",
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  if (!spec.copy_bundle || typeof spec.copy_bundle !== "object") {
    return {
      success: false,
      failure: {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork",
        message: "Invalid render_spec: copy_bundle required",
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  return { success: true, inputs: { render_spec: spec } };
}

/**
 * Render HTML from template + copy bundle + media plan.
 *
 * MVO stub: generates static HTML with placeholder blocks.
 * Post-MVO: this would invoke the real template engine from
 * LiNKsites/apps/web-master with proper component rendering.
 */
function generateHtmlFromSpec(spec: RenderSpec, artifactRef: string): string {
  const blocks = spec.copy_bundle.blocks
    .map((block) => {
      const textEntries = Object.entries(block.text)
        .map(([key, value]) => `          <p data-key="${key}">${escapeHtml(value)}</p>`)
        .join("\n");

      return `        <section data-block-id="${block.block_id}">
${textEntries}
        </section>`;
    })
    .join("\n\n");

  const mediaPlacements = spec.media_plan.placements
    .map((placement) => {
      if (placement.kind === "placeholder") {
        return `        <div data-media-block="${placement.block_id}" data-asset="${placement.asset_ref}" class="placeholder">
          <div class="placeholder-box">[Image: ${placement.asset_ref}]</div>
        </div>`;
      }
      return `        <div data-media-block="${placement.block_id}" data-asset="${placement.asset_ref}" class="stock">
          <img src="/api/media/${placement.asset_ref}" alt="" />
        </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${spec.copy_bundle.locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview — ${escapeHtml(spec.template_id)}</title>
  <style>
    :root { font-family: system-ui, sans-serif; line-height: 1.5; }
    body { max-width: 800px; margin: 0 auto; padding: 2rem; }
    section { margin: 2rem 0; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
    .placeholder-box { background: #f3f4f6; border: 2px dashed #d1d5db; padding: 2rem; text-align: center; color: #6b7280; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <header>
    <h1>Website Preview</h1>
    <p>Template: ${escapeHtml(spec.template_id)}</p>
    <p>Artifact: ${artifactRef}</p>
  </header>

  <main>
${blocks}
  </main>

  <aside>
    <h2>Media Plan</h2>
${mediaPlacements}
  </aside>

  <footer>
    <p>Generated by LiNKautowork WebsiteFactory</p>
  </footer>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Compensation function: cleans up partially rendered artifacts.
 */
async function compensateRender(artifactRef: string): Promise<void> {
  artifactStore.delete(artifactRef);
}

/**
 * Main workflow handler for autowork.websitefactory.render.
 */
export function createRenderWorkflowHandler(
  auditEmitter: AuditEmitter,
): WorkflowHandler<WebsiteFactoryRenderInputs, WebsiteFactoryRenderOutputs> {
  return async (request, context) => {
    const startTime = Date.now();

    // Emit workflow.invoked
    const invokedEventId = await auditEmitter.emitInvoked(request, context.workflow_run_id);

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

    const { render_spec } = inputResult.inputs;

    try {
      // Generate artifact reference (deterministic for idempotency)
      const artifactRef = `artifact:${context.tenant_id}:${context.run_id}:${render_spec.template_id}:${context.idempotency_key}`;

      // Render HTML bundle
      const htmlContent = generateHtmlFromSpec(render_spec, artifactRef);

      // Store artifact (MVO stub: in-memory map)
      const artifact: RenderedArtifact = {
        artifact_ref: artifactRef,
        tenant_id: context.tenant_id,
        run_id: context.run_id,
        template_id: render_spec.template_id,
        created_at: new Date().toISOString(),
        bundle_path: `/previews/${artifactRef}/index.html`,
        html_content: htmlContent,
      };

      artifactStore.set(artifactRef, artifact);

      const duration = Date.now() - startTime;

      const outputs: WebsiteFactoryRenderOutputs = {
        preview_artifact_ref: artifactRef,
        render_stats: {
          template_id: render_spec.template_id,
          blocks_rendered: render_spec.copy_bundle.blocks.length,
          media_placements: render_spec.media_plan.placements.length,
          render_duration_ms: duration,
        },
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
      const errorMessage = error instanceof Error ? error.message : "Unknown render error";

      // Compensation: clean up partial artifact
      const partialRef = `artifact:${context.tenant_id}:${context.run_id}:${render_spec.template_id}:${context.idempotency_key}`;
      await compensateRender(partialRef);

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
        "Render failed, partial artifact cleaned up",
        failedEventId,
      );

      return {
        failure: {
          code: "WORKFLOW_STEP_FAILED",
          message: errorMessage,
          retryable: true,
        },
        audit_event_ids: [invokedEventId, failedEventId, compensatedEventId],
        compensation: async () => compensateRender(partialRef),
      };
    }
  };
}

/**
 * Retrieve a rendered artifact by reference (used by preview_serve).
 */
export function getRenderedArtifact(artifactRef: string): RenderedArtifact | undefined {
  return artifactStore.get(artifactRef);
}

export { artifactStore };
