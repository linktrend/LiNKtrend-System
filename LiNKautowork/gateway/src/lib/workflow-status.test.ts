import { describe, expect, it, beforeEach } from "vitest";
import {
  buildRunView,
  clearWorkflowStatusStore,
  recordWorkflowRun,
  updateWorkflowRun,
  workflowStatusQuery,
  type WorkflowRunView,
} from "./workflow-status.js";

describe("workflow status read model", () => {
  beforeEach(() => {
    clearWorkflowStatusStore();
  });

  it("records and retrieves workflow run by id", () => {
    const view: WorkflowRunView = {
      workflow_run_id: "run-1",
      tenant_id: "tenant-1",
      run_id: "parent-run-1",
      stage_id: "stage-1",
      workflow_handle: "autowork.linksites.artifact_write_local",
      status: "succeeded",
      attempt: 1,
      idempotency_key: "parent-run-1:stage-1:autowork.linksites.artifact_write_local",
      lease_id: "lease-1",
      audit_event_ids: ["evt-1", "evt-2"],
      outputs: { artifact_ref: "artifact-1" },
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
    };

    recordWorkflowRun(view);
    const retrieved = workflowStatusQuery.byWorkflowRunId("run-1");

    expect(retrieved).toEqual(view);
  });

  it("retrieves run by idempotency key", () => {
    const idempotencyKey = "run-1:stage-1:autowork.linksites.supabase_mirror_upsert";
    const view: WorkflowRunView = {
      workflow_run_id: "run-2",
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "stage-1",
      workflow_handle: "autowork.linksites.supabase_mirror_upsert",
      status: "succeeded",
      attempt: 1,
      idempotency_key: idempotencyKey,
      lease_id: "lease-1",
      audit_event_ids: ["evt-1", "evt-2"],
      outputs: { mirror_write_ref: "mirror-1" },
    };

    recordWorkflowRun(view);
    const retrieved = workflowStatusQuery.byIdempotencyKey(idempotencyKey);

    expect(retrieved?.workflow_run_id).toBe("run-2");
    expect(retrieved?.idempotency_key).toBe(idempotencyKey);
  });

  it("lists active runs (pending or running)", () => {
    const pending: WorkflowRunView = {
      workflow_run_id: "run-pending",
      tenant_id: "tenant-1",
      run_id: "parent-1",
      stage_id: "stage-1",
      workflow_handle: "autowork.linksites.payload_sync_local",
      status: "pending",
      attempt: 1,
      idempotency_key: "key-1",
      audit_event_ids: ["evt-1"],
    };

    const running: WorkflowRunView = {
      workflow_run_id: "run-running",
      tenant_id: "tenant-1",
      run_id: "parent-1",
      stage_id: "stage-2",
      workflow_handle: "autowork.linksites.preview_readiness_check",
      status: "running",
      attempt: 2,
      idempotency_key: "key-2",
      audit_event_ids: ["evt-2"],
    };

    const succeeded: WorkflowRunView = {
      workflow_run_id: "run-succeeded",
      tenant_id: "tenant-1",
      run_id: "parent-1",
      stage_id: "stage-3",
      workflow_handle: "autowork.linksites.crm_ready_to_contact_mark",
      status: "succeeded",
      attempt: 1,
      idempotency_key: "key-3",
      audit_event_ids: ["evt-3"],
    };

    recordWorkflowRun(pending);
    recordWorkflowRun(running);
    recordWorkflowRun(succeeded);

    const active = workflowStatusQuery.listActive("tenant-1");

    expect(active).toHaveLength(2);
    expect(active.map((r) => r.workflow_run_id)).toContain("run-pending");
    expect(active.map((r) => r.workflow_run_id)).toContain("run-running");
    expect(active.map((r) => r.workflow_run_id)).not.toContain("run-succeeded");
  });

  it("lists recent runs sorted by time", () => {
    const now = Date.now();

    for (let i = 0; i < 5; i++) {
      recordWorkflowRun({
        workflow_run_id: `run-${i}`,
        tenant_id: "tenant-1",
        run_id: "parent-1",
        stage_id: `stage-${i}`,
        workflow_handle: "autowork.linksites.artifact_write_local",
        status: "succeeded",
        attempt: 1,
        idempotency_key: `key-${i}`,
        audit_event_ids: [`evt-${i}`],
        started_at: new Date(now - i * 1000).toISOString(), // older as i increases
      });
    }

    const recent = workflowStatusQuery.listRecent(3);

    expect(recent).toHaveLength(3);
    expect(recent[0].workflow_run_id).toBe("run-0"); // newest first
    expect(recent[1].workflow_run_id).toBe("run-1");
    expect(recent[2].workflow_run_id).toBe("run-2");
  });

  it("updates run status", () => {
    const view: WorkflowRunView = {
      workflow_run_id: "run-1",
      tenant_id: "tenant-1",
      run_id: "parent-1",
      stage_id: "stage-1",
      workflow_handle: "autowork.linksites.supabase_mirror_upsert",
      status: "running",
      attempt: 1,
      idempotency_key: "key-1",
      audit_event_ids: ["evt-1"],
    };

    recordWorkflowRun(view);

    const updated = updateWorkflowRun("run-1", {
      status: "succeeded",
      outputs: { mirror_write_ref: "mirror-1" },
      ended_at: new Date().toISOString(),
    });

    expect(updated?.status).toBe("succeeded");
    expect(updated?.outputs).toEqual({ mirror_write_ref: "mirror-1" });

    const retrieved = workflowStatusQuery.byWorkflowRunId("run-1");
    expect(retrieved?.status).toBe("succeeded");
  });

  it("queries by tenant and parent run id", () => {
    const views: WorkflowRunView[] = [
      {
        workflow_run_id: "run-a1",
        tenant_id: "tenant-1",
        run_id: "parent-a",
        stage_id: "stage-1",
        workflow_handle: "autowork.linksites.artifact_write_local",
        status: "succeeded",
        attempt: 1,
        idempotency_key: "key-a1",
        audit_event_ids: ["evt-a1"],
      },
      {
        workflow_run_id: "run-a2",
        tenant_id: "tenant-1",
        run_id: "parent-a",
        stage_id: "stage-2",
        workflow_handle: "autowork.linksites.supabase_mirror_upsert",
        status: "succeeded",
        attempt: 1,
        idempotency_key: "key-a2",
        audit_event_ids: ["evt-a2"],
      },
      {
        workflow_run_id: "run-b1",
        tenant_id: "tenant-1",
        run_id: "parent-b",
        stage_id: "stage-1",
        workflow_handle: "autowork.linksites.payload_sync_local",
        status: "succeeded",
        attempt: 1,
        idempotency_key: "key-b1",
        audit_event_ids: ["evt-b1"],
      },
    ];

    views.forEach(recordWorkflowRun);

    const parentA = workflowStatusQuery.byTenantAndRun("tenant-1", "parent-a");
    expect(parentA).toHaveLength(2);
    expect(parentA.map((r) => r.workflow_run_id)).toContain("run-a1");
    expect(parentA.map((r) => r.workflow_run_id)).toContain("run-a2");

    const parentB = workflowStatusQuery.byTenantAndRun("tenant-1", "parent-b");
    expect(parentB).toHaveLength(1);
    expect(parentB[0].workflow_run_id).toBe("run-b1");
  });

  it("builds run view from invoke result with retry_exhausted", () => {
    const result = {
      workflow_run_id: "run-1",
      status: "failed" as const,
      audit_event_ids: ["evt-1", "evt-2"],
      failure: {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork" as const,
        message: "Step failed",
        retryable: false,
        details: { retry_exhausted: true },
        occurred_at: new Date().toISOString(),
      },
    };

    const view = buildRunView(
      "tenant-1",
      "parent-run-1",
      "stage-1",
      "autowork.linksites.artifact_write_local",
      "key-1",
      result,
      3,
      "lease-1",
    );

    expect(view.workflow_run_id).toBe("run-1");
    expect(view.tenant_id).toBe("tenant-1");
    expect(view.run_id).toBe("parent-run-1");
    expect(view.stage_id).toBe("stage-1");
    expect(view.workflow_handle).toBe("autowork.linksites.artifact_write_local");
    expect(view.status).toBe("failed");
    expect(view.attempt).toBe(3);
    expect(view.idempotency_key).toBe("key-1");
    expect(view.lease_id).toBe("lease-1");
    expect(view.retry_exhausted).toBe(true);
  });

  it("exposes idempotency proof - same key returns same run", () => {
    const idempotencyKey = "run-1:stage-1:autowork.linksites.supabase_mirror_upsert";

    const view1: WorkflowRunView = {
      workflow_run_id: "wf-run-abc",
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "stage-1",
      workflow_handle: "autowork.linksites.supabase_mirror_upsert",
      status: "succeeded",
      attempt: 1,
      idempotency_key: idempotencyKey,
      audit_event_ids: ["evt-1", "evt-2"],
      outputs: { mirror_write_ref: "mirror-1" },
    };

    recordWorkflowRun(view1);

    // Simulate idempotent replay
    const retrieved = workflowStatusQuery.byIdempotencyKey(idempotencyKey);
    expect(retrieved?.workflow_run_id).toBe("wf-run-abc");
    expect(retrieved?.outputs).toEqual({ mirror_write_ref: "mirror-1" });
  });
});
