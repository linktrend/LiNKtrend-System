import { describe, expect, it } from "vitest";

import {
  assertProjectTraceSurfaceComplete,
  demoProjectTraceSurface,
  type ProjectApprovalGate,
  type ProjectTraceStep,
} from "./project-trace-governance";

describe("project trace governance (LTS-003)", () => {
  it("shows LinkSkills lease, LiNKautowork workflow, and LiNKbrain audit refs per step", () => {
    const surface = demoProjectTraceSurface("demo-smb");

    expect(surface.steps.length).toBeGreaterThan(0);
    expect(surface.steps.every((step) => step.linkskillsLeaseRef != null)).toBe(true);
    expect(surface.steps.every((step) => step.linkautoworkWorkflowRef != null)).toBe(true);
    expect(surface.steps.every((step) => step.linkbrainAuditRef != null)).toBe(true);
    expect(assertProjectTraceSurfaceComplete(surface)).toEqual({ ok: true, missing: [] });
  });

  it("captures client approval gates for budget, knowledge, and protected side effects", () => {
    const surface = demoProjectTraceSurface("demo-smb");

    expect(surface.approvalGates.map((gate) => gate.kind)).toEqual([
      "budget",
      "knowledge",
      "protected_side_effect",
    ]);
    expect(surface.approvalGates.every((gate) => gate.allowedRoles.length > 0)).toBe(true);
    expect(surface.approvalGates.filter((gate) => gate.requiresPrincipal).map((gate) => gate.kind)).toEqual([
      "budget",
      "protected_side_effect",
    ]);
  });

  it("reports missing trace refs and approval roles", () => {
    const brokenStep: ProjectTraceStep = {
      id: "missing-audit",
      order: 1,
      phase: "Publish",
      issue: "Payload Sync",
      status: "running",
      linkskillsLeaseRef: "lease-1",
      linkautoworkWorkflowRef: "workflow-1",
      linkbrainAuditRef: null,
      sideEffect: "Sync content",
      updatedAt: "2026-06-01T00:00:00.000Z",
    };
    const brokenGate: ProjectApprovalGate = {
      id: "gate-1",
      kind: "protected_side_effect",
      label: "Publish approval",
      status: "pending",
      allowedRoles: [],
      requiresPrincipal: true,
      policyRef: "company.policy.protected_side_effects",
      linkedStepId: "missing-audit",
    };

    expect(
      assertProjectTraceSurfaceComplete({
        projectId: "project-1",
        steps: [brokenStep],
        approvalGates: [brokenGate],
      }),
    ).toEqual({
      ok: false,
      missing: [
        "step:missing-audit:linkbrainAuditRef",
        "gate:budget",
        "gate:knowledge",
        "gate:gate-1:allowedRoles",
      ],
    });
  });
});
