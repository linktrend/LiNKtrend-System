import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  buildMvoManifestFromKernelTrace,
  readMvoLatestRunManifest,
  resolveMvoRunManifestPath,
  writeMvoLatestRunManifest,
} from "@/lib/mvo-run-manifest";

describe("mvo run manifest", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
    delete process.env.MVO_LATEST_RUN_PATH;
  });

  it("writes and reads manifest JSON under LiNKdev reports path", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mvo-manifest-"));
    tempDirs.push(root);
    fs.mkdirSync(path.join(root, "LiNKdev"), { recursive: true });

    const manifest = buildMvoManifestFromKernelTrace({
      run_id: "run-1",
      tenant_id: "tenant-1",
      project_id: "project-1",
      status: "succeeded",
      preview_url: "https://example.linktrend.media",
      preview_artifact_ref: "artifact:1",
      stages: [
        {
          stage_id: "lead_intake",
          status: "succeeded",
          refs: { lease_ids: ["l1"], workflow_run_ids: ["w1"], audit_event_ids: ["a1"] },
        },
      ],
      lease_ids: ["l1"],
      workflow_run_ids: ["w1"],
      audit_event_ids: ["a1"],
    });

    const written = writeMvoLatestRunManifest(manifest, root);
    expect(written).toBe(resolveMvoRunManifestPath(root));
    expect(fs.existsSync(written)).toBe(true);

    const loaded = readMvoLatestRunManifest(root);
    expect(loaded?.run_id).toBe("run-1");
    expect(loaded?.project_id).toBe("project-1");
    expect(loaded?.phase_timeline).toHaveLength(1);
  });

  it("honors MVO_LATEST_RUN_PATH override", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mvo-manifest-override-"));
    tempDirs.push(root);
    const customPath = path.join(root, "custom-run.json");
    process.env.MVO_LATEST_RUN_PATH = customPath;

    writeMvoLatestRunManifest(
      buildMvoManifestFromKernelTrace({
        run_id: "run-2",
        tenant_id: "tenant-2",
        status: "succeeded",
        stages: [],
        lease_ids: [],
        workflow_run_ids: [],
        audit_event_ids: [],
      }),
      root,
    );

    expect(readMvoLatestRunManifest(root)?.run_id).toBe("run-2");
  });
});
