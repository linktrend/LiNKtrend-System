/**
 * Workflow audit event emitter.
 *
 * Emits workflow-level audit events per CONTRACTS_MVO.md §6.3.1:
 * - workflow.invoked
 * - workflow.completed
 * - workflow.failed
 * - workflow.compensated
 */

import { randomUUID } from "node:crypto";
import type {
  AuditEvent,
  WorkflowInvokeRequest,
  Plane,
} from "@linktrend/linklogic-sdk";

const PLANE: Plane = "linkautowork";

export interface AuditEmitter {
  emitInvoked: (request: WorkflowInvokeRequest, workflow_run_id: string) => Promise<string>;
  emitCompleted: (
    request: WorkflowInvokeRequest,
    workflow_run_id: string,
    outputs: Record<string, unknown>,
    parent_event_id: string,
  ) => Promise<string>;
  emitFailed: (
    request: WorkflowInvokeRequest,
    workflow_run_id: string,
    error: { code: string; message: string; retryable: boolean },
    parent_event_id: string,
  ) => Promise<string>;
  emitCompensated: (
    request: WorkflowInvokeRequest,
    workflow_run_id: string,
    reason: string,
    parent_event_id: string,
  ) => Promise<string>;
}

/**
 * Create an audit emitter that writes to LiNKbrain.
 *
 * For MVO: events are collected and returned in WorkflowInvokeResult.
 * The actual write to LiNKbrain happens via the caller (LiNKaios kernel)
 * which has access to the brain.audit.write RPC.
 */
export function createAuditEmitter(
  writeEvent: (event: AuditEvent) => Promise<{ event_id: string }>,
): AuditEmitter {
  async function emitInvoked(
    request: WorkflowInvokeRequest,
    workflow_run_id: string,
  ): Promise<string> {
    const event: AuditEvent = {
      event_id: randomUUID(),
      ts: new Date().toISOString(),
      tenant_id: request.tenant_id,
      plane: PLANE,
      actor: {
        actor_kind: "system",
        actor_id: `linkautowork.workflow.${request.workflow_handle}`,
      },
      action: "workflow.invoked",
      subject: {
        run_id: request.run_id,
        stage_id: request.stage_id,
        workflow_run_id,
        lease_id: request.lease_id,
      },
      payload: {
        workflow_handle: request.workflow_handle,
        idempotency_key: request.idempotency_key,
        // Note: inputs are NOT echoed to avoid leaking PII or large payloads.
        input_keys: Object.keys(request.inputs),
      },
      schema_version: "1",
    };

    const result = await writeEvent(event);
    return result.event_id;
  }

  async function emitCompleted(
    request: WorkflowInvokeRequest,
    workflow_run_id: string,
    outputs: Record<string, unknown>,
    parent_event_id: string,
  ): Promise<string> {
    const event: AuditEvent = {
      event_id: randomUUID(),
      ts: new Date().toISOString(),
      tenant_id: request.tenant_id,
      plane: PLANE,
      actor: {
        actor_kind: "system",
        actor_id: `linkautowork.workflow.${request.workflow_handle}`,
      },
      action: "workflow.completed",
      subject: {
        run_id: request.run_id,
        stage_id: request.stage_id,
        workflow_run_id,
        lease_id: request.lease_id,
        preview_artifact_ref: typeof outputs.preview_artifact_ref === "string"
          ? outputs.preview_artifact_ref
          : undefined,
        preview_url: typeof outputs.preview_url === "string"
          ? outputs.preview_url
          : undefined,
      },
      refs: {
        parent_event_id,
      },
      payload: {
        workflow_handle: request.workflow_handle,
        output_keys: Object.keys(outputs),
        // Include safe, non-PII output summaries only
        has_preview_artifact_ref: Boolean(outputs.preview_artifact_ref),
        has_preview_url: Boolean(outputs.preview_url),
      },
      schema_version: "1",
    };

    const result = await writeEvent(event);
    return result.event_id;
  }

  async function emitFailed(
    request: WorkflowInvokeRequest,
    workflow_run_id: string,
    error: { code: string; message: string; retryable: boolean },
    parent_event_id: string,
  ): Promise<string> {
    const event: AuditEvent = {
      event_id: randomUUID(),
      ts: new Date().toISOString(),
      tenant_id: request.tenant_id,
      plane: PLANE,
      actor: {
        actor_kind: "system",
        actor_id: `linkautowork.workflow.${request.workflow_handle}`,
      },
      action: "workflow.failed",
      subject: {
        run_id: request.run_id,
        stage_id: request.stage_id,
        workflow_run_id,
        lease_id: request.lease_id,
      },
      refs: {
        parent_event_id,
      },
      payload: {
        workflow_handle: request.workflow_handle,
        failure_code: error.code,
        failure_message: error.message,
        retryable: error.retryable,
      },
      schema_version: "1",
    };

    const result = await writeEvent(event);
    return result.event_id;
  }

  async function emitCompensated(
    request: WorkflowInvokeRequest,
    workflow_run_id: string,
    reason: string,
    parent_event_id: string,
  ): Promise<string> {
    const event: AuditEvent = {
      event_id: randomUUID(),
      ts: new Date().toISOString(),
      tenant_id: request.tenant_id,
      plane: PLANE,
      actor: {
        actor_kind: "system",
        actor_id: `linkautowork.workflow.${request.workflow_handle}`,
      },
      action: "workflow.compensated",
      subject: {
        run_id: request.run_id,
        stage_id: request.stage_id,
        workflow_run_id,
        lease_id: request.lease_id,
      },
      refs: {
        parent_event_id,
      },
      payload: {
        workflow_handle: request.workflow_handle,
        compensation_reason: reason,
      },
      schema_version: "1",
    };

    const result = await writeEvent(event);
    return result.event_id;
  }

  return {
    emitInvoked,
    emitCompleted,
    emitFailed,
    emitCompensated,
  };
}
