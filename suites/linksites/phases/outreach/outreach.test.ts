import { describe, expect, it } from "vitest";

import { buildApprovedOutreachDispatch, buildOutreachDraft } from "./outreach.js";

describe("LinkSites outreach (Wave 9.4)", () => {
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

  it("builds approved dispatch only when principal_approval is true", () => {
    expect(
      buildApprovedOutreachDispatch({
        tenant_id: "tenant-1",
        run_id: "run-1",
        publish_url: "https://demo.linktrend.internal/en",
        outreach_draft_ref: "outreach_draft:tenant-1:run-1",
        principal_approval: false,
      }),
    ).toBeNull();

    const dispatch = buildApprovedOutreachDispatch({
      tenant_id: "tenant-1",
      run_id: "run-1",
      publish_url: "https://demo.linktrend.internal/en",
      outreach_draft_ref: "outreach_draft:tenant-1:run-1",
      principal_approval: true,
    });

    expect(dispatch?.send_mode).toBe("live");
    expect(dispatch?.outreach_status).toBe("dispatched");
  });
});
