import { describe, expect, it } from "vitest";
import { buildLexosOperatorFlowProof } from "./operator-flow";

describe("LEXOS operator flow helper", () => {
  it("builds matter intake, evidence/research status, tasks, and trace proof", () => {
    const proof = buildLexosOperatorFlowProof({
      run_id: "run-225-lexos",
      tenant_id: "tenant-dev",
      matter_id: "matter-001",
      client_id: "client-001",
      jurisdiction: "TW-TPE",
    });

    expect(proof.module).toBe("lexos_litigation");
    expect(proof.matter_intake.intake_status).toBe("accepted");
    expect(proof.evidence_research.evidence_status).toBe("ready");
    expect(proof.tasks.length).toBeGreaterThanOrEqual(3);
    expect(proof.trace.governed_refs.linkskills_capability_refs).toContain("cap.research.legal");
    expect(proof.trace.governed_refs.linkautowork_handles).toContain("autowork.lexos.assertion_sync");
    expect(proof.trace.governed_refs.linkbrain_event_refs).toContain("support.mapped");
    expect(proof.trace.governed_refs.linkbot_role_refs).toContain("lexos_analyst");
    expect(proof.trace.governed_refs.plane_task_refs[0]).toContain("plane:");
  });
});
