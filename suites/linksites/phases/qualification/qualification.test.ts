import { describe, expect, it } from "vitest";

import { buildQualificationFromResearchBundle } from "./qualification.js";

describe("LinkSites qualification (LTS-102)", () => {
  it("derives business type and industry from research bundle", () => {
    const record = buildQualificationFromResearchBundle({
      tenant_id: "tenant-1",
      run_id: "run-1",
      lead_input: { industry: "Dental", business_type: "local_service" },
      lead_research_bundle: {
        comparable_businesses: [{ industry: "Professional Services" }],
      },
    });

    expect(record.industry).toBe("Dental");
    expect(record.business_type).toBe("local_service");
    expect(record.run_id).toBe("run-1");
  });
});
