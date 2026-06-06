/**
 * LiNKdeveloper workflow-map ingress tests.
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { WorkflowInvokeRequest } from "@linktrend/linklogic-sdk";
import type { WorkflowContext } from "../types/index.js";
import {
  createProductRunBootstrapHandler,
  createIssueDispatchHandler,
  createValidationRecordHandler,
  PRODUCT_RUN_BOOTSTRAP_HANDLE,
  ISSUE_DISPATCH_HANDLE,
  VALIDATION_RECORD_HANDLE,
  ARTIFACT_WRITE_HANDLE,
  getProductRunBootstrap,
  getWorkflowMapHandles,
  clearLinkdeveloperStores,
} from "./linkdeveloper.js";

function createMockAuditEmitter() {
  let eventCounter = 0;
  return {
    emitInvoked: async () => `event-invoked-${++eventCounter}`,
    emitCompleted: async () => `event-completed-${++eventCounter}`,
    emitFailed: async () => `event-failed-${++eventCounter}`,
    emitCompensated: async () => `event-compensated-${++eventCounter}`,
    emitPreviewReadinessChecked: async () => `event-readiness-checked-${++eventCounter}`,
    emitPreviewReadinessFailed: async () => `event-readiness-failed-${++eventCounter}`,
  };
}

function createMockRequest(overrides: Partial<WorkflowInvokeRequest> = {}): WorkflowInvokeRequest {
  return {
    tenant_id: "00000000-0000-0000-0000-000000000001",
    run_id: "3c6bcf45-79eb-473e-8211-04518dcab6f2",
    stage_id: "product_run_bootstrap",
    workflow_handle: PRODUCT_RUN_BOOTSTRAP_HANDLE,
    inputs: {
      product_run_id: "d5e68d09-189b-4ed4-8ccf-a581ef71397a",
      product_name: "Hello World G1",
      project_id: "d5e68d09-189b-4ed4-8ccf-a581ef71397a",
    },
    lease_id: "lease-g1-bootstrap",
    idempotency_key: "g1-bootstrap-3c6bcf45-79eb-473e-8211-04518dcab6f2",
    ...overrides,
  } as WorkflowInvokeRequest;
}

function createMockContext(overrides: Partial<WorkflowContext> = {}): WorkflowContext {
  return {
    env: {},
    tenant_id: "00000000-0000-0000-0000-000000000001",
    run_id: "3c6bcf45-79eb-473e-8211-04518dcab6f2",
    stage_id: "product_run_bootstrap",
    workflow_run_id: "wf-g1-bootstrap",
    idempotency_key: "g1-bootstrap-3c6bcf45-79eb-473e-8211-04518dcab6f2",
    ...overrides,
  } as WorkflowContext;
}

describe("LiNKdeveloper workflow-map ingress", () => {
  beforeEach(() => {
    clearLinkdeveloperStores();
  });

  it("exposes all four workflow-map handles", () => {
    const handles = getWorkflowMapHandles();
    expect(handles).toHaveLength(4);
    expect(handles).toEqual([
      PRODUCT_RUN_BOOTSTRAP_HANDLE,
      ISSUE_DISPATCH_HANDLE,
      VALIDATION_RECORD_HANDLE,
      ARTIFACT_WRITE_HANDLE,
    ]);
  });

  it("bootstraps a product run and opens Module 1 issues", async () => {
    const handler = createProductRunBootstrapHandler(createMockAuditEmitter());
    const result = await handler(createMockRequest(), createMockContext());

    expect("outputs" in result).toBe(true);
    if (!("outputs" in result)) return;

    expect(result.outputs.status).toBe("bootstrapped");
    expect(result.outputs.module_key).toBe("module_01_opportunity_intake");
    expect(result.outputs.issues_opened).toContain("linkdeveloper.bootstrap");
    expect(result.outputs.zulip_bootstrap).toMatchObject({
      governed: true,
      topic: "intake",
    });
    expect(getProductRunBootstrap("d5e68d09-189b-4ed4-8ccf-a581ef71397a")).toBeDefined();
  });

  it("fails closed when lease_id is missing on side-effecting workflows", async () => {
    const bootstrapHandler = createProductRunBootstrapHandler(createMockAuditEmitter());
    const dispatchHandler = createIssueDispatchHandler(createMockAuditEmitter());

    const bootstrapResult = await bootstrapHandler(
      createMockRequest({ lease_id: undefined }),
      createMockContext(),
    );
    expect("failure" in bootstrapResult).toBe(true);
    if ("failure" in bootstrapResult) {
      expect(bootstrapResult.failure.code).toBe("LEASE_REQUEST_INVALID");
    }

    const dispatchResult = await dispatchHandler(
      createMockRequest({
        workflow_handle: ISSUE_DISPATCH_HANDLE,
        inputs: {
          product_run_id: "d5e68d09-189b-4ed4-8ccf-a581ef71397a",
          issue_id: "issue-001",
        },
        lease_id: undefined,
      }),
      createMockContext({ stage_id: "issue_dispatch" }),
    );
    expect("failure" in dispatchResult).toBe(true);
    if ("failure" in dispatchResult) {
      expect(dispatchResult.failure.code).toBe("LEASE_REQUEST_INVALID");
    }
  });
});
