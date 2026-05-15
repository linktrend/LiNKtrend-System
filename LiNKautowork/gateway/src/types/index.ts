/**
 * LiNKautowork Gateway Types
 *
 * Workflow-specific type extensions beyond the MVO contracts.
 */

import type {
  RenderSpec,
  WorkflowInvokeRequest,
  WorkflowInvokeResult,
} from "@linktrend/linklogic-sdk";

/**
 * Inputs for autowork.websitefactory.render workflow.
 * Extracted from WorkflowInvokeRequest.inputs.
 */
export interface WebsiteFactoryRenderInputs {
  render_spec: RenderSpec;
}

/**
 * Outputs for autowork.websitefactory.render workflow.
 */
export interface WebsiteFactoryRenderOutputs {
  [key: string]: unknown;
  preview_artifact_ref: string;
  render_stats: {
    template_id: string;
    blocks_rendered: number;
    media_placements: number;
    render_duration_ms: number;
  };
}

/**
 * Inputs for autowork.websitefactory.preview_serve workflow.
 */
export interface WebsiteFactoryPreviewServeInputs {
  preview_artifact_ref: string;
  tenant_id: string;
  run_id: string;
}

/**
 * Outputs for autowork.websitefactory.preview_serve workflow.
 */
export interface WebsiteFactoryPreviewServeOutputs {
  [key: string]: unknown;
  preview_url: string;
  preview_artifact_ref: string;
  serve_route: string;
  expires_at?: string;
}

/**
 * Rendered artifact storage record (MVO stub: local storage).
 */
export interface RenderedArtifact {
  artifact_ref: string;
  tenant_id: string;
  run_id: string;
  template_id: string;
  created_at: string;
  expires_at?: string;
  bundle_path: string;
  html_index_path: string;
}

/**
 * Workflow execution context passed to all handlers.
 */
export interface WorkflowContext {
  env: unknown;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  workflow_run_id: string;
  lease_id?: string;
  idempotency_key: string;
}

/**
 * Workflow handler signature.
 */
export type WorkflowHandler<
  TInputs = unknown,
  TOutputs extends Record<string, unknown> = Record<string, unknown>,
> = (
  request: WorkflowInvokeRequest,
  context: WorkflowContext,
) => Promise<{
  outputs: TOutputs;
  audit_event_ids: string[];
} | {
  failure: {
    code: string;
    message: string;
    retryable: boolean;
  };
  audit_event_ids: string[];
  compensation?: () => Promise<void>;
}>;

/**
 * Registered workflow definition.
 */
export interface WorkflowDefinition {
  handle: string;
  display_name: string;
  description: string;
  requires_lease: boolean;
  handler: WorkflowHandler;
}
