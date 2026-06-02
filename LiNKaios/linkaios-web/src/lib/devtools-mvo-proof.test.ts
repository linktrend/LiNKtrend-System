import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildDevtoolsMvoProof } from "@/lib/devtools-mvo-proof";

describe("devtools MVO proof helper", () => {
  it("builds deterministic WebsiteFactory, LEXOS, and LiNKapps proof sections", () => {
    const proof = buildDevtoolsMvoProof({
      cwd: path.join(os.tmpdir(), "linkaios-devtools-mvo-proof-no-manifest"),
    });

    expect(proof.source).toBe("static-sample");
    expect(proof.websitefactory.status).toBe("succeeded");
    expect(proof.websitefactory.timeline.length).toBeGreaterThanOrEqual(2);
    expect(proof.websitefactory.lease_ids.length).toBeGreaterThan(0);
    expect(proof.websitefactory.workflow_run_ids.length).toBeGreaterThan(0);
    expect(proof.websitefactory.audit_event_ids.length).toBeGreaterThan(0);
    expect(proof.websitefactory.preview.preview_local_route).toContain("/preview/tenant-dev/");

    expect(proof.lexos.module).toBe("lexos_litigation");
    expect(proof.lexos.tasks.length).toBeGreaterThanOrEqual(3);

    expect(proof.linkapps.module).toBe("linkapps.app_factory");
    expect(proof.linkapps.handoff_package.handoff_package_ref).toContain("handoff:");
  });
});
