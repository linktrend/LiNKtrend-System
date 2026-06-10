import { describe, expect, it } from "vitest";

import { stripeProductDashboardUrl } from "@/lib/admin/stripe/dashboard-url";
import { formatBillingFrequency, formatStripeAmount, majorUnitsToCents } from "@/lib/admin/stripe/format";
import { parseCreatePriceBody, parseCreateProductBody, parseLinkSuiteBody } from "@/lib/admin/stripe/parse-request";

describe("stripe format helpers", () => {
  it("converts major units to cents", () => {
    expect(majorUnitsToCents(29.99)).toBe(2999);
    expect(majorUnitsToCents(0)).toBe(0);
  });

  it("formats billing frequency labels", () => {
    expect(
      formatBillingFrequency({
        type: "recurring",
        recurringInterval: "month",
        recurringIntervalCount: 1,
      }),
    ).toBe("Monthly");
    expect(
      formatBillingFrequency({
        type: "one_time",
        recurringInterval: null,
        recurringIntervalCount: null,
      }),
    ).toBe("One-time");
  });

  it("formats stripe amounts", () => {
    expect(formatStripeAmount(1999, "usd")).toMatch(/19\.99/);
    expect(formatStripeAmount(null, "usd")).toBe("—");
  });
});

describe("stripe dashboard urls", () => {
  it("builds test and live product urls", () => {
    expect(stripeProductDashboardUrl("prod_abc", true)).toBe(
      "https://dashboard.stripe.com/test/products/prod_abc",
    );
    expect(stripeProductDashboardUrl("prod_abc", false)).toBe(
      "https://dashboard.stripe.com/products/prod_abc",
    );
  });
});

describe("stripe request parsers", () => {
  it("parses create product body", () => {
    expect(parseCreateProductBody({ name: "LinkSites", suiteId: "linksites" })).toEqual({
      name: "LinkSites",
      description: undefined,
      suiteId: "linksites",
    });
    expect(parseCreateProductBody({})).toBeNull();
  });

  it("parses create price body", () => {
    const parsed = parseCreatePriceBody({
      productId: "prod_x",
      amount: 49,
      currency: "usd",
      type: "recurring",
      recurringInterval: "year",
    });
    expect(parsed?.unitAmountCents).toBe(4900);
    expect(parsed?.recurringInterval).toBe("year");
  });

  it("parses suite linkage body", () => {
    expect(parseLinkSuiteBody({ suiteId: "linksites", stripeProductId: "prod_1" })).toEqual({
      suiteId: "linksites",
      stripeProductId: "prod_1",
    });
  });
});
