import { describe, expect, it } from "vitest";

import { adminProjectTypeLabel, classifyAdminProjectType } from "@/lib/admin-project-types";

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
});
