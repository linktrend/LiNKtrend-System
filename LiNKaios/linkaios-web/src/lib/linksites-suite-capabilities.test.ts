import { describe, expect, it } from "vitest";

import type { CapabilityContext } from "../../../../LiNKskills/capability-connectors/types";
import {
  LINKSITES_SUITE_CAPABILITY_IDS,
  createLinksitesSuiteCapabilityRuntime,
} from "../../../../LiNKskills/capability-connectors/linksites-suite-defaults";

const baseContext: CapabilityContext = {
  tenant_id: "tenant-demo",
  run_id: "run-1",
  stage_id: "linksites.crm.promote_ready",
  actor: { actor_kind: "linkbot", actor_id: "lead-scout" },
  lease_id: "lease-abc",
  idempotency_key: "idem-1",
  mode: "shadow",
};

describe("LinkSites suite capability runtimes", () => {
  it("exports all MVO LinkSites connector ids", () => {
    expect(LINKSITES_SUITE_CAPABILITY_IDS).toEqual([
      "cap.crm.odoo_shadow",
      "cap.payload.local_sync",
      "cap.supabase.mirror_content",
      "cap.research.public_web",
      "cap.asset.generation",
    ]);
  });

  it("requires lease for CRM shadow lead read", async () => {
    const runtime = createLinksitesSuiteCapabilityRuntime("cap.crm.odoo_shadow");
    const denied = await runtime.execute("lead.read_mock", { lead_id: "L1" }, {
      ...baseContext,
      lease_id: "",
    });
    expect(denied.success).toBe(false);
    expect(denied.error?.code).toBe("LEASE_REQUIRED");
  });

  it("executes payload local sync with audit trail", async () => {
    const runtime = createLinksitesSuiteCapabilityRuntime("cap.payload.local_sync");
    const result = await runtime.execute("content.upsert_local", { site_id: "s1" }, baseContext);
    expect(result.success).toBe(true);
    expect(result.audit_events?.some((e) => e.action === "payload.content.upserted")).toBe(true);
  });

  it("blocks live writes for asset generation", async () => {
    const runtime = createLinksitesSuiteCapabilityRuntime("cap.asset.generation");
    const result = await runtime.execute("image.generate", {}, { ...baseContext, mode: "live" });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("LIVE_MODE_DISABLED");
  });
});
