import { describe, expect, it } from "vitest";
import { buildLinkappsOperatorFlowProof } from "./operator-flow";

describe("LiNKapps operator flow helper", () => {
  it("builds app brief, squad status, provider readiness, tasks, and handoff proof", () => {
    const proof = buildLinkappsOperatorFlowProof({
      run_id: "run-225-linkapps",
      tenant_id: "tenant-dev",
      venture_id: "venture-001",
      app_slug: "nova-app",
    });

    expect(proof.module).toBe("linkapps.app_factory");
    expect(proof.app_brief.app_slug).toBe("nova-app");
    expect(proof.squad_status.status).toBe("executing");
    expect(proof.provider_readiness.plane).toBe("shadow_ready");
    expect(proof.tasks.length).toBeGreaterThanOrEqual(3);
    expect(proof.handoff_package.workflow_run_ids).toContain(
      "wf:autowork.linkapps.compile_handoff:tenant-dev:run-225-linkapps",
    );
    expect(proof.trace.governed_refs.linkskills_capability_refs).toContain("cap.plane.execution_tracking");
    expect(proof.trace.governed_refs.linkbrain_event_refs).toContain("linkapps.handoff.ready");
  });
});
