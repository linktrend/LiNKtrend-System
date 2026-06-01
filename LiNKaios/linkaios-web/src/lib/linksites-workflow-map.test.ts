import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  assertLinksitesWorkflowMapValid,
  LINKSITES_FORBIDDEN_SKIP_STAGE_IDS,
  LINKSITES_PRINCIPAL_STAGE_IDS,
  LINKSITES_PRINCIPAL_STAGES,
} from "../../../../suites/linksites/workflow-map";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("LinkSites workflow map (LTS-060)", () => {
  it("lists seven Principal stages without skip stage ids", () => {
    const stageIds = LINKSITES_PRINCIPAL_STAGES.map((s) => s.stageId);
    const result = assertLinksitesWorkflowMapValid(stageIds);
    expect(result.ok, result.errors.join("; ")).toBe(true);
    for (const forbidden of LINKSITES_FORBIDDEN_SKIP_STAGE_IDS) {
      expect(stageIds).not.toContain(forbidden);
    }
  });

  it("matches MVO order: lead gen through close/recycle", () => {
    expect(LINKSITES_PRINCIPAL_STAGE_IDS).toEqual([
      "linksites.lead_generation",
      "linksites.qualification",
      "linksites.template_selection",
      "linksites.website_build",
      "linksites.publish",
      "linksites.outreach",
      "linksites.close_or_recycle",
    ]);
  });

  it("workflow.md documents seven business steps without forbidden skip markers", () => {
    const md = readFileSync(join(repoRoot, "suites/linksites/workflow.md"), "utf8");
    expect(md).toMatch(/seven Principal steps/i);
    for (const forbidden of LINKSITES_FORBIDDEN_SKIP_STAGE_IDS) {
      expect(md).not.toContain(forbidden);
    }
    for (const stageId of LINKSITES_PRINCIPAL_STAGE_IDS) {
      expect(md).toContain(stageId);
    }
  });
});
