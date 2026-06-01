import { describe, expect, it } from "vitest";

import {
  assertGovernanceTraceComplete,
  governanceTraceHref,
  mapKernelStageToGovernanceTrace,
  requiresRoleApproval,
  sideEffectApprovalsHref,
} from "./client-governance-traces";

describe("client governance traces (LTS-003)", () => {
  it("maps kernel stage refs to LinkSkills, LiNKautowork, LiNKbrain planes", () => {
    const step = mapKernelStageToGovernanceTrace({
      stage_id: "outreach_send",
      status: "completed",
      responsible_plane: "linkbot",
      refs: {
        lease_ids: ["lease-abc"],
        workflow_run_ids: ["wf-run-1"],
        audit_event_ids: ["evt-99"],
      },
    });
    expect(step.refs).toEqual([
      { plane: "linkskills", ref_type: "lease", ref_id: "lease-abc" },
      { plane: "linkautowork", ref_type: "workflow_run", ref_id: "wf-run-1" },
      { plane: "linkbrain", ref_type: "audit_event", ref_id: "evt-99" },
    ]);
  });

  it("acceptance: trace view links and role gates for protected side effects", () => {
    const steps = [
      mapKernelStageToGovernanceTrace({
        stage_id: "publish_site",
        status: "completed",
        responsible_plane: "linkautowork",
        refs: {
          lease_ids: ["lease-1"],
          workflow_run_ids: ["wf-1"],
          audit_event_ids: ["audit-1"],
        },
      }),
    ];
    const traceCheck = assertGovernanceTraceComplete(steps);
    expect(traceCheck.ok).toBe(true);
    expect(governanceTraceHref("proj-1", "run-1")).toBe("/settings/traces?project=proj-1&run=run-1");
    expect(sideEffectApprovalsHref("proj-1")).toBe("/projects/proj-1?tab=tools#pending-approvals");
    expect(requiresRoleApproval("protected_send", "tenant_member")).toBe(true);
    expect(requiresRoleApproval("protected_send", "tenant_admin")).toBe(false);
  });
});
