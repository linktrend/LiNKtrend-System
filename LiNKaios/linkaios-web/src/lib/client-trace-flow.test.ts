import { describe, expect, it } from "vitest";

import {
  assertProjectTraceSurfaceComplete,
  buildDemoProjectTraceSurface,
  canApproveBudgetGate,
  canApproveKnowledgeGate,
  canApproveProtectedSideEffectGate,
  projectTraceHref,
} from "./client-trace-flow";

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

    expect(canApproveProtectedSideEffectGate("licensee", "user")).toBe(false);
    expect(canApproveProtectedSideEffectGate("licensee", "admin")).toBe(true);
  });
});
