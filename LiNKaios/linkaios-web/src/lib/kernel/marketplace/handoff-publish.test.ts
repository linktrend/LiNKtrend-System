import { describe, expect, it } from "vitest";

import {
  handoffPublishBlocked,
  pluginManifestFromHandoff,
} from "./handoff-publish";

describe("handoff publish (Wave 6.4 / 10.3)", () => {
  const base = {
    handoff_id: "handoff_simple_crm_lead_odoo_shadow_1_0_0",
    schema_version: "linksuitegen.handoff.v1",
    suite_id: "simple_crm_lead_odoo_shadow",
    suite_family: "crm_lead_capture",
    suite_version: "1.0.0",
    bundle_path: "artifacts/exports/simple_crm_lead_odoo_shadow/1.0.0/bundle",
    validation_status: "validated" as const,
    display_name: "Simple CRM Lead Capture (Odoo Shadow)",
  };

  it("blocks non-validated handoffs", () => {
    const blocked = handoffPublishBlocked({ ...base, validation_status: "pending" });
    expect(blocked?.ok).toBe(false);
  });

  it("builds marketplace manifest with linksuitegen source", () => {
    const manifest = pluginManifestFromHandoff(base);
    expect(manifest.plugin_id).toBe("simple_crm_lead_odoo_shadow");
    const marketplace = (manifest as { marketplace?: { source?: string; publish_state?: string } }).marketplace;
    expect(marketplace?.source).toBe("linksuitegen");
    expect(marketplace?.publish_state).toBe("published");
  });
});
