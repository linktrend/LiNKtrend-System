import { describe, expect, it } from "vitest";

import { parseTenantCouncilEntitlement } from "@/lib/council/types";

describe("parseTenantCouncilEntitlement", () => {
  it("reads llm_council_enabled from config_json", () => {
    expect(parseTenantCouncilEntitlement({ llm_council_enabled: true }).llm_council_enabled).toBe(
      true,
    );
  });

  it("reads base_subscription.includes_llm_council", () => {
    expect(
      parseTenantCouncilEntitlement({
        base_subscription: { includes_llm_council: true },
      }).llm_council_enabled,
    ).toBe(true);
  });

  it("defaults false when unset", () => {
    expect(parseTenantCouncilEntitlement({}).llm_council_enabled).toBe(false);
  });
});
