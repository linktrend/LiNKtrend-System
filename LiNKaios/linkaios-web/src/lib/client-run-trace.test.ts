import { describe, expect, it } from "vitest";

import {
  buildClientRunTrace,
  canApproveClientTraceGate,
  CLIENT_TRACE_GATE_LABELS,
  CLIENT_TRACE_STEP_IDS,
} from "./client-run-trace";

describe("client run trace surface (LTS-003)", () => {
  it("renders every LinkSites MVO step with lease, workflow, and audit refs", () => {
    const trace = buildClientRunTrace("demo-smb");

    expect(trace.projectId).toBe("demo-smb");
    expect(trace.stages.map((stage) => stage.id)).toEqual(CLIENT_TRACE_STEP_IDS);
    for (const stage of trace.stages) {
      expect(stage.refs.leaseIds.length, `${stage.id} lease refs`).toBeGreaterThan(0);
      expect(stage.refs.workflowRunIds.length, `${stage.id} workflow refs`).toBeGreaterThan(0);
      expect(stage.refs.auditEventIds.length, `${stage.id} audit refs`).toBeGreaterThan(0);
    }
  });

  it("defines role-gated approval surfaces for budget, knowledge, and protected side effects", () => {
    const trace = buildClientRunTrace("demo-smb");
    const gateKinds = trace.approvalGates.map((gate) => gate.kind);

    expect(gateKinds).toEqual(["budget", "knowledge", "protected_side_effect"]);
    expect(CLIENT_TRACE_GATE_LABELS).toEqual({
      budget: "Budget Approval",
      knowledge: "Knowledge Approval",
      protected_side_effect: "Protected Side Effect",
    });
  });

  it("allows licensee admins but not users to approve Client trace gates", () => {
    expect(canApproveClientTraceGate("licensee", "user", "budget")).toBe(false);
    expect(canApproveClientTraceGate("licensee", "admin", "budget")).toBe(true);
    expect(canApproveClientTraceGate("licensee", "super_admin", "knowledge")).toBe(true);
    expect(canApproveClientTraceGate("licensee", "admin", "protected_side_effect")).toBe(true);
    expect(canApproveClientTraceGate("licensor", "super_admin", "protected_side_effect")).toBe(false);
  });
});
