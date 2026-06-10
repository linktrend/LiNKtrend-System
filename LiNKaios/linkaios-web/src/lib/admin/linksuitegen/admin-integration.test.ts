import { describe, expect, it, beforeEach } from "vitest";

import { publishCandidate, recordHumanReview, runMachineReview } from "@/lib/admin/linksuitegen/candidate-lifecycle";
import { importHandoff } from "@/lib/admin/linksuitegen/handoff-service";
import { listMarketplacePlugins, resetLinksuitegenStoreForTests } from "@/lib/admin/linksuitegen/store";
import { buildFleetDashboardRows } from "@/lib/admin/fleet-dashboard";

describe("linksuitegen admin integration (Wave 6)", () => {
  beforeEach(() => {
    process.env.LINKSUITEGEN_ADMIN_STORE_MODE = "memory";
    resetLinksuitegenStoreForTests();
  });

  it("imports handoff and publishes simple_crm to marketplace", async () => {
    const candidate = await importHandoff({
      handoff_id: "handoff_test",
      schema_version: "linksuitegen.handoff.v1",
      suite_id: "simple_crm_lead_odoo_shadow",
      suite_family: "crm_lead_capture",
      suite_version: "1.0.0",
      bundle_path: "simple_crm_lead_odoo_shadow/1.0.0/bundle",
      validation_status: "validated",
      display_name: "Simple CRM Lead",
      admin_install_target: { admin_only_source_suite: false },
    });
    expect(candidate.status).toBe("admin_draft_installed");

    const mr = await runMachineReview(candidate.candidate_id);
    expect(mr.status).toBe("passed");

    await recordHumanReview({
      candidate_id: candidate.candidate_id,
      reviewer_id: "principal",
      decision: "approved",
    });

    const published = await publishCandidate(candidate.candidate_id);
    expect(published.status).toBe("published");
    expect(published.client_marketplace_visible).toBe(true);

    const plugins = await listMarketplacePlugins();
    expect(plugins.some((p) => p.suite_id === "simple_crm_lead_odoo_shadow")).toBe(true);
  });

  it("rejects linksuitegen self-suite handoff", async () => {
    await expect(
      importHandoff({
        handoff_id: "h1",
        schema_version: "linksuitegen.handoff.v1",
        suite_id: "linksuitegen",
        suite_family: "factory",
        suite_version: "1.0.0",
        bundle_path: "x",
        validation_status: "validated",
      }),
    ).rejects.toThrow(/cannot be published/);
  });

  it("fleet dashboard lists 5 OC + 8 AZ rows", () => {
    const rows = buildFleetDashboardRows();
    expect(rows.filter((r) => r.kind === "openclaw")).toHaveLength(5);
    expect(rows.filter((r) => r.kind === "agent_zero")).toHaveLength(8);
  });
});
