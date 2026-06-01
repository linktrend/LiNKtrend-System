import { describe, expect, it } from "vitest";

import { buildOutreachDraft } from "./outreach.js";

describe("LinkSites outreach (LTS-106)", () => {
  it("creates governed draft record pending Principal approval", () => {
    const record = buildOutreachDraft({
      tenant_id: "tenant-1",
      run_id: "run-1",
      lead_id: "lead-1",
      publish_url: "https://demo-lead.linktrend.media",
    });

    expect(record.send_mode).toBe("draft_only");
    expect(record.outreach_status).toBe("draft_pending_principal_approval");
  });
});
