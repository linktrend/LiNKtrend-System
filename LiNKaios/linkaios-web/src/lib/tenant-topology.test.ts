import { describe, expect, it } from "vitest";

import { brandsForCompany, resolveBrandFixture } from "@/lib/brand-fixtures";
import { parseLicenseeContext } from "@/lib/licensee-context";
import { topologyDisplayMode, resolveTopologyCompanyId } from "@/lib/tenant-topology";

describe("tenant topology", () => {
  it("single entity mode hides company switcher", () => {
    expect(topologyDisplayMode("single_entity_single_brand").showCompanySwitcher).toBe(false);
    expect(topologyDisplayMode("single_entity_many_brands").showCompanySwitcher).toBe(false);
    expect(topologyDisplayMode("many_entities_many_brands").showCompanySwitcher).toBe(true);
  });

  it("single entity topology pins company id", () => {
    expect(resolveTopologyCompanyId("single_entity_many_brands", "harbor-legal", "xyz-marketing")).toBe(
      "xyz-marketing",
    );
  });
});

describe("licensee context", () => {
  it("parses company without implicit brand in URL", () => {
    const ctx = parseLicenseeContext(new URLSearchParams("companyId=acme-dental"));
    expect(ctx.companyId).toBe("acme-dental");
    expect(ctx.brandId).toBeNull();
  });

  it("respects explicit brand", () => {
    const ctx = parseLicenseeContext(new URLSearchParams("companyId=acme-dental&brandId=acme-kids"));
    expect(ctx.brandId).toBe("acme-kids");
  });
});

describe("brand fixtures", () => {
  it("xyz marketing has two brands", () => {
    expect(brandsForCompany("xyz-marketing")).toHaveLength(2);
  });

  it("invalid brand falls back to default for company", () => {
    expect(resolveBrandFixture("missing", "harbor-legal")?.id).toBe("harbor-main");
  });
});
