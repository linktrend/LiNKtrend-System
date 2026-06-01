import { describe, expect, it } from "vitest";

import {
  assertProjectTraceSurfaceComplete,
  buildDemoProjectTraceSurface,
  canApproveBudgetGate,
  canApproveKnowledgeGate,
  canApproveProtectedSideEffectGate,
  projectTraceHref,
  projectTraceSurfaceFromKernelRows,
  projectTraceSurfaceFromRun,
  selectProjectTraceRun,
} from "./client-trace-flow";
import type { RunOverview } from "./cockpit/cockpit-types";

describe("client trace flow (LTS-003)", () => {
  it("shows lease, workflow, and audit refs for every trace step", () => {
    const surface = buildDemoProjectTraceSurface("demo-smb");

    expect(surface.projectId).toBe("demo-smb");
    expect(surface.steps.length).toBeGreaterThanOrEqual(3);
    for (const step of surface.steps) {
      expect(step.leaseIds.length).toBeGreaterThan(0);
      expect(step.workflowRunIds.length).toBeGreaterThan(0);
      expect(step.auditEventIds.length).toBeGreaterThan(0);
    }
  });

  it("requires budget, knowledge, and protected side-effect gates", () => {
    const result = assertProjectTraceSurfaceComplete({
      hasLeaseRefs: true,
      hasWorkflowRefs: true,
      hasAuditRefs: true,
      hasBudgetGate: true,
      hasKnowledgeGate: true,
      hasProtectedSideEffectGate: true,
    });

    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("reports missing trace refs and gates with stable IDs", () => {
    const result = assertProjectTraceSurfaceComplete({
      hasLeaseRefs: false,
      hasWorkflowRefs: false,
      hasAuditRefs: false,
      hasBudgetGate: false,
      hasKnowledgeGate: false,
      hasProtectedSideEffectGate: false,
    });

    expect(result.ok).toBe(false);
    expect(result.missing).toEqual([
      "trace_lease_refs",
      "trace_workflow_refs",
      "trace_audit_refs",
      "budget_gate",
      "knowledge_gate",
      "protected_side_effect_gate",
    ]);
  });

  it("encodes project trace tab hrefs", () => {
    expect(projectTraceHref("proj/demo 1")).toBe("/projects/proj%2Fdemo%201?tab=traces");
  });

  it("gates approvals by client role policy", () => {
    expect(canApproveBudgetGate("licensee", "user")).toBe(false);
    expect(canApproveBudgetGate("licensee", "admin")).toBe(true);
    expect(canApproveBudgetGate("licensee", "super_admin")).toBe(true);
    expect(canApproveBudgetGate("licensor", "super_admin")).toBe(false);

    expect(canApproveKnowledgeGate("licensee", "user")).toBe(false);
    expect(canApproveKnowledgeGate("licensee", "admin")).toBe(true);
    expect(canApproveKnowledgeGate("licensor", "super_admin")).toBe(false);

    expect(canApproveProtectedSideEffectGate("licensee", "user")).toBe(false);
    expect(canApproveProtectedSideEffectGate("licensee", "admin")).toBe(true);
    expect(canApproveProtectedSideEffectGate("licensor", "super_admin")).toBe(false);
  });

  it("surfaces protected side-effect gates for publish and outreach", () => {
    const surface = buildDemoProjectTraceSurface("demo-smb");

    expect(
      surface.approvalGates
        .filter((gate) => gate.type === "protected_side_effect")
        .map((gate) => gate.stageId),
    ).toEqual(["linksites.publish", "linksites.outreach"]);
  });

  it("selects live project runs by kernel run ID, not metrics trace row ID", () => {
    const run = {
      run_id: "kernel-run-1",
      tenant_id: "tenant-1",
      plugin_id: "linksites",
      work_request_type: "linksites.mvo",
      status: "running",
      started_at: "2026-06-01T00:00:00.000Z",
      ended_at: null,
      stages: [
        {
          stage_id: "linksites.publish",
          run_id: "kernel-run-1",
          display_name: "Publish",
          responsible_plane: "linkautowork",
          status: "running",
          attempt: 1,
          started_at: "2026-06-01T00:00:00.000Z",
          ended_at: null,
          lease_ids: ["lease-live"],
          workflow_run_ids: ["wf-live"],
          audit_event_ids: ["audit-live"],
          failure_message: null,
        },
      ],
      total_stages: 1,
      completed_stages: 0,
      failed_stages: 0,
      lease_count: 1,
      workflow_run_count: 1,
      failure_summary: null,
    } satisfies RunOverview;

    expect(
      selectProjectTraceRun([run], [
        { traceRowId: "trace-row-1", runId: "kernel-run-1" },
      ])?.run_id,
    ).toBe("kernel-run-1");

    const surface = projectTraceSurfaceFromRun("demo-smb", run);
    expect(surface.steps[0]).toMatchObject({
      id: "linksites.publish",
      leaseIds: ["lease-live"],
      workflowRunIds: ["wf-live"],
      auditEventIds: ["audit-live"],
      approvalGateType: "protected_side_effect",
    });
  });

  it("maps kernel trace RPC rows into per-stage refs", () => {
    const surface = projectTraceSurfaceFromKernelRows(
      "demo-smb",
      {
        run_id: "kernel-run-2",
        tenant_id: "tenant-1",
        plugin_id: "linksites",
        status: "succeeded",
        started_at: "2026-06-01T00:00:00.000Z",
        ended_at: "2026-06-01T00:01:00.000Z",
      },
      [
        {
          stage_id: "linksites.outreach",
          responsible_plane: "linkbot",
          status: "succeeded",
          attempt: 1,
          started_at: "2026-06-01T00:00:00.000Z",
          ended_at: "2026-06-01T00:01:00.000Z",
          lease_ids: ["lease-outreach"],
          workflow_run_ids: ["wf-outreach"],
          audit_event_ids: ["audit-outreach"],
        },
      ],
    );

    expect(surface.runId).toBe("kernel-run-2");
    expect(surface.steps[0]).toMatchObject({
      label: "Outreach",
      leaseIds: ["lease-outreach"],
      workflowRunIds: ["wf-outreach"],
      auditEventIds: ["audit-outreach"],
      approvalGateType: "protected_side_effect",
    });
  });
});
