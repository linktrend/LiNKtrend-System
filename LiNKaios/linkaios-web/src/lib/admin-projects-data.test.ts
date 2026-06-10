import { describe, expect, it } from "vitest";

import { adminProjectTypeLabel, classifyAdminProjectType, resolveAdminProjectCreatePreset } from "@/lib/admin-project-types";
import { liveProjectModulesFromIds } from "@/lib/project-modules-data";

describe("admin projects data (Wave 5A)", () => {
  it("classifies LiNKsuitegen rows as Suite Gen", () => {
    expect(classifyAdminProjectType("linksuitegen", [])).toBe("suite_gen");
    expect(adminProjectTypeLabel("suite_gen")).toBe("Suite Gen");
  });

  it("classifies librarian modules as Librarian Filings", () => {
    expect(classifyAdminProjectType("linkbrain", ["linksites.librarian"])).toBe("librarian_filings");
    expect(adminProjectTypeLabel("librarian_filings")).toBe("Librarian Filings");
  });

  it("falls back to Platform Ops for other vendor work", () => {
    expect(classifyAdminProjectType("linksites", ["website-factory"])).toBe("platform_ops");
  });

  it("maps admin create presets for governed launch", () => {
    const preset = resolveAdminProjectCreatePreset("librarian_filings");
    expect(preset.suiteId).toBe("linkbrain");
    expect(preset.moduleIds).toContain("linksites.librarian");
  });

  it("builds live module rows from persisted module_ids", () => {
    const rows = liveProjectModulesFromIds(["suite-gen-catalogue"], {
      suiteId: "linksuitegen",
      cadence: "continuous",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.templateId).toBe("suite-gen-catalogue");
    expect(rows[0]?.continuous).toBe(true);
    expect(rows[0]?.name).toBe("Suite catalogue pipeline");
    expect(rows[0]?.phaseCount).toBeGreaterThan(0);
    expect(rows[0]?.issueCount).toBeGreaterThan(0);
    expect(rows[0]?.suiteName).toBe("LiNKsuitegen");
  });
});
