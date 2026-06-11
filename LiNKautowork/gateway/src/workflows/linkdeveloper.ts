/**
 * LiNKdeveloper workflow-map ingress handlers.
 *
 * Deterministic workflow handlers for the four required LiNKdeveloper handles
 * per suites/linkdeveloper/workflow.md and LiNKdeveloper linkautowork adapter bindings.
 *
 * Workflow handles:
 * - autowork.linkdeveloper.product_run_bootstrap
 * - autowork.linkdeveloper.issue_dispatch
 * - autowork.linkdeveloper.validation_record
 * - autowork.linkdeveloper.artifact_write
 */

import { createHash } from "node:crypto";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { AuditEmitter } from "../lib/audit-emitter.js";
import type { WorkflowHandler } from "../types/index.js";

export const PRODUCT_RUN_BOOTSTRAP_HANDLE = "autowork.linkdeveloper.product_run_bootstrap";
export const ISSUE_DISPATCH_HANDLE = "autowork.linkdeveloper.issue_dispatch";
export const VALIDATION_RECORD_HANDLE = "autowork.linkdeveloper.validation_record";
export const ARTIFACT_WRITE_HANDLE = "autowork.linkdeveloper.artifact_write";

export const LINKDEVELOPER_WORKFLOW_MAP_HANDLES = [
  PRODUCT_RUN_BOOTSTRAP_HANDLE,
  ISSUE_DISPATCH_HANDLE,
  VALIDATION_RECORD_HANDLE,
  ARTIFACT_WRITE_HANDLE,
] as const;

const bootstraps = new Map<string, Record<string, unknown>>();
const dispatches = new Map<string, Record<string, unknown>>();
const validations = new Map<string, Record<string, unknown>>();
const artifacts = new Map<string, Record<string, unknown>>();

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readInput(request: WorkflowInvokeRequest, key: string): unknown {
  return (request.inputs as Record<string, unknown>)[key];
}

function asString(request: WorkflowInvokeRequest, key: string): string | undefined {
  const value = readInput(request, key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function fail(
  code: string,
  message: string,
  retryable = false,
): { code: string; message: string; retryable: boolean } {
  return { code, message, retryable };
}

function requireLeaseId(request: WorkflowInvokeRequest):
  | { ok: true; leaseId: string }
  | { ok: false; failure: { code: string; message: string; retryable: boolean } } {
  if (!request.lease_id || request.lease_id.trim().length === 0) {
    return {
      ok: false,
      failure: fail("LEASE_REQUEST_INVALID", "Missing required lease_id for side-effecting workflow"),
    };
  }
  return { ok: true, leaseId: request.lease_id };
}

function requireIdempotencyKey(request: WorkflowInvokeRequest):
  | { ok: true; idempotencyKey: string }
  | { ok: false; failure: { code: string; message: string; retryable: boolean } } {
  if (!request.idempotency_key || request.idempotency_key.trim().length === 0) {
    return {
      ok: false,
      failure: fail("LEASE_IDEMPOTENCY_CONFLICT", "Missing required idempotency_key"),
    };
  }
  return { ok: true, idempotencyKey: request.idempotency_key };
}

function resolveProductRunId(request: WorkflowInvokeRequest): string | undefined {
  return asString(request, "product_run_id") ?? request.run_id;
}

async function withAudit(
  request: WorkflowInvokeRequest,
  workflow_run_id: string,
  auditEmitter: AuditEmitter,
  run: (invokedEventId: string) => Promise<
    | { outputs: Record<string, unknown> }
    | { failure: { code: string; message: string; retryable: boolean } }
  >,
): Promise<
  | { outputs: Record<string, unknown>; audit_event_ids: string[] }
  | { failure: { code: string; message: string; retryable: boolean }; audit_event_ids: string[] }
> {
  const invokedEventId = await auditEmitter.emitInvoked(request, workflow_run_id);
  const result = await run(invokedEventId);

  if ("failure" in result) {
    const failedEventId = await auditEmitter.emitFailed(
      request,
      workflow_run_id,
      result.failure,
      invokedEventId,
    );
    return { failure: result.failure, audit_event_ids: [invokedEventId, failedEventId] };
  }

  const completedEventId = await auditEmitter.emitCompleted(
    request,
    workflow_run_id,
    result.outputs,
    invokedEventId,
  );
  return { outputs: result.outputs, audit_event_ids: [invokedEventId, completedEventId] };
}

const MODULE_01_BOOTSTRAP_ISSUES = [
  "linkdeveloper.bootstrap",
  "linkdeveloper.steward.conversation",
  "linkdeveloper.market.analysis",
] as const;

/** Opens a product run and seeds Module 1 opportunity-intake issues. */
export function createProductRunBootstrapHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idemCheck = requireIdempotencyKey(request);
      if (!idemCheck.ok) return { failure: idemCheck.failure };

      const productRunId = resolveProductRunId(request);
      if (!productRunId) {
        return {
          failure: fail("WORKFLOW_STEP_FAILED", "Missing required input: product_run_id or run_id"),
        };
      }

      const cacheKey = idemCheck.idempotencyKey;
      const cached = bootstraps.get(cacheKey);
      if (cached) {
        return { outputs: { ...cached, idempotent_replay: true } };
      }

      const productName = asString(request, "product_name") ?? "LiNKdeveloper product run";
      const projectId = asString(request, "project_id") ?? productRunId;
      const mode = asString(request, "mode") ?? "shadow";

      const record = {
        workflow_handle: PRODUCT_RUN_BOOTSTRAP_HANDLE,
        tenant_id: request.tenant_id,
        product_run_id: productRunId,
        project_id: projectId,
        product_name: productName,
        module_key: "module_01_opportunity_intake",
        issues_opened: [...MODULE_01_BOOTSTRAP_ISSUES],
        steward_agent_id: "linkdeveloper-steward",
        orchestrator_agent_id: "linkdeveloper-orchestrator",
        zulip_bootstrap: {
          stream: `project-${projectId}`,
          topic: "intake",
          governed: true,
          mode,
        },
        status: "bootstrapped",
        lease_id: leaseCheck.leaseId,
        content_digest: digest({
          productRunId,
          projectId,
          productName,
          issues: MODULE_01_BOOTSTRAP_ISSUES,
        }),
      };

      bootstraps.set(cacheKey, record);
      bootstraps.set(productRunId, record);

      return { outputs: record };
    });
  };
}

/** Routes an issue to a governed executor lane. */
export function createIssueDispatchHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idemCheck = requireIdempotencyKey(request);
      if (!idemCheck.ok) return { failure: idemCheck.failure };

      const productRunId = resolveProductRunId(request);
      const issueId = asString(request, "issue_id");
      const issueKey = asString(request, "issue_key") ?? issueId;

      if (!productRunId || !issueId) {
        return {
          failure: fail(
            "WORKFLOW_STEP_FAILED",
            "Missing required inputs: product_run_id (or run_id) and issue_id",
          ),
        };
      }

      const cacheKey = idemCheck.idempotencyKey;
      const cached = dispatches.get(cacheKey);
      if (cached) {
        return { outputs: { ...cached, idempotent_replay: true } };
      }

      const executorType = asString(request, "executor_type") ?? "linkautowork";
      const record = {
        workflow_handle: ISSUE_DISPATCH_HANDLE,
        tenant_id: request.tenant_id,
        product_run_id: productRunId,
        issue_id: issueId,
        issue_key: issueKey,
        executor_type: executorType,
        dispatch_status: "routed",
        lease_id: leaseCheck.leaseId,
        content_digest: digest({ productRunId, issueId, issueKey, executorType }),
      };

      dispatches.set(cacheKey, record);
      return { outputs: record };
    });
  };
}

/** Records validation evidence for an issue. */
export function createValidationRecordHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idemCheck = requireIdempotencyKey(request);
      if (!idemCheck.ok) return { failure: idemCheck.failure };

      const productRunId = resolveProductRunId(request);
      const issueId = asString(request, "issue_id");
      const validationType = asString(request, "validation_type") ?? "autowork_run_validation";

      if (!productRunId || !issueId) {
        return {
          failure: fail(
            "WORKFLOW_STEP_FAILED",
            "Missing required inputs: product_run_id (or run_id) and issue_id",
          ),
        };
      }

      const cacheKey = idemCheck.idempotencyKey;
      const cached = validations.get(cacheKey);
      if (cached) {
        return { outputs: { ...cached, idempotent_replay: true } };
      }

      const record = {
        workflow_handle: VALIDATION_RECORD_HANDLE,
        tenant_id: request.tenant_id,
        product_run_id: productRunId,
        issue_id: issueId,
        validation_type: validationType,
        validation_status: "recorded",
        lease_id: leaseCheck.leaseId,
        content_digest: digest({ productRunId, issueId, validationType }),
      };

      validations.set(cacheKey, record);
      return { outputs: record };
    });
  };
}

/** Persists a durable artifact reference. */
export function createArtifactWriteHandler(auditEmitter: AuditEmitter): WorkflowHandler {
  return async (request, context) => {
    return withAudit(request, context.workflow_run_id, auditEmitter, async () => {
      const leaseCheck = requireLeaseId(request);
      if (!leaseCheck.ok) return { failure: leaseCheck.failure };

      const idemCheck = requireIdempotencyKey(request);
      if (!idemCheck.ok) return { failure: idemCheck.failure };

      const productRunId = resolveProductRunId(request);
      const artifactId = asString(request, "artifact_id");

      if (!productRunId || !artifactId) {
        return {
          failure: fail(
            "WORKFLOW_STEP_FAILED",
            "Missing required inputs: product_run_id (or run_id) and artifact_id",
          ),
        };
      }

      const cacheKey = idemCheck.idempotencyKey;
      const cached = artifacts.get(cacheKey);
      if (cached) {
        return { outputs: { ...cached, idempotent_replay: true } };
      }

      const contentUri =
        asString(request, "content_uri") ??
        `linkdeveloper://artifacts/${productRunId}/${artifactId}`;

      const record = {
        workflow_handle: ARTIFACT_WRITE_HANDLE,
        tenant_id: request.tenant_id,
        product_run_id: productRunId,
        artifact_id: artifactId,
        content_uri: contentUri,
        artifact_status: "persisted",
        lease_id: leaseCheck.leaseId,
        content_digest: digest({ productRunId, artifactId, contentUri }),
      };

      artifacts.set(cacheKey, record);
      return { outputs: record };
    });
  };
}

export function getProductRunBootstrap(productRunId: string): Record<string, unknown> | undefined {
  return bootstraps.get(productRunId);
}

export function getIssueDispatch(idempotencyKey: string): Record<string, unknown> | undefined {
  return dispatches.get(idempotencyKey);
}

export function getValidationRecord(idempotencyKey: string): Record<string, unknown> | undefined {
  return validations.get(idempotencyKey);
}

export function getArtifactWrite(idempotencyKey: string): Record<string, unknown> | undefined {
  return artifacts.get(idempotencyKey);
}

export function getWorkflowMapHandles(): string[] {
  return [...LINKDEVELOPER_WORKFLOW_MAP_HANDLES];
}

export function clearLinkdeveloperStores(): void {
  bootstraps.clear();
  dispatches.clear();
  validations.clear();
  artifacts.clear();
}
