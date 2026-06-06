import { describe, expect, it } from "vitest";

import { parseMarketplaceMeta } from "./catalogue";

describe("marketplace catalogue parsing (Wave 6.4)", () => {
  it("lists builtin linksites without explicit marketplace block", () => {
    const item = parseMarketplaceMeta("linksites", {}, "Lead-to-site loop", "LinkSites", "active");
    expect(item?.id).toBe("linksites");
    expect(item?.published).toBe(true);
  });

  it("filters client-invisible suites", () => {
    const item = parseMarketplaceMeta(
      "linkdeveloper",
      { marketplace: { client_visible: false, marketplace_listed: true } },
      "Factory suite",
      "LiNKdeveloper",
      "active",
    );
    expect(item).toBeNull();
  });

  it("maps linksuitegen source from manifest", () => {
    const item = parseMarketplaceMeta(
      "simple_crm_lead_odoo_shadow",
      {
        marketplace: {
          source: "linksuitegen",
          marketplace_listed: true,
          publish_state: "published",
          stripe_mode: "shadow",
          price_monthly_usd: 49,
        },
      },
      "CRM lead capture",
      "Simple CRM Lead",
      "active",
    );
    expect(item?.source).toBe("linksuitegen");
    expect(item?.stripeMode).toBe("shadow");
    expect(item?.priceMonthlyUsd).toBe(49);
  });
});
