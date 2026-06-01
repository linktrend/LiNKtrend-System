import { describe, expect, it } from "vitest";

import { selectTemplateFromRegistry } from "./template-selection.js";

describe("LinkSites template selection (LTS-103)", () => {
  it("selects template from external registry guidance by industry", () => {
    const record = selectTemplateFromRegistry({
      tenant_id: "tenant-1",
      run_id: "run-1",
      industry: "Dental",
      qualification: { business_type: "local_service", industry: "Dental" },
    });

    expect(record.template_id).toBe("professional_v1");
    expect(record.registry_source).toBe("linksites_external");
  });

  it("defaults to minimal_v1 when industry is unknown", () => {
    const record = selectTemplateFromRegistry({
      tenant_id: "tenant-1",
      run_id: "run-1",
      industry: "unknown_vertical",
    });

    expect(record.template_id).toBe("minimal_v1");
  });
});
