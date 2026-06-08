import { describe, expect, it } from "vitest";

import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { normalizeLicensorLicenseeTab } from "@/lib/company-page-copy";
import { companiesBrandsIndexForLicensee, contractEntitySummaryForLicensee } from "@/lib/licensor-licensee-profile";

describe("contractEntitySummaryForLicensee", () => {
  it("returns operational contract fields without throwing when corporate address is absent", () => {
    const summary = contractEntitySummaryForLicensee("unknown-tenant", COMPANY_FIXTURES[0]!);

    expect(summary.legalName).toBeTruthy();
    expect(summary.registeredOffice).toEqual(
      expect.objectContaining({
        streetAddress1: expect.any(String),
        city: expect.any(String),
        country: expect.any(String),
      }),
    );
    expect(summary.registrationNumber).toBeTruthy();
    expect(summary.email).toBeTruthy();
  });

  it("maps demo licensee xyz-marketing to contract entity summary", () => {
    const company = COMPANY_FIXTURES.find((c) => c.id === "xyz-marketing")!;
    const summary = contractEntitySummaryForLicensee("xyz-marketing", company);

    expect(summary.legalName).toContain("XYZ");
    expect(summary.plan).toMatch(/LiNKaios/i);
    expect(summary.status).toBe("active");
  });
});

describe("companiesBrandsIndexForLicensee", () => {
  it("returns operational index rows for a demo licensee", () => {
    const rows = companiesBrandsIndexForLicensee("xyz-marketing", COMPANY_FIXTURES);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        companyId: expect.any(String),
        brandId: expect.any(String),
        linkbotCount: expect.any(Number),
      }),
    );
  });
});

describe("licensor licensee tab normalization", () => {
  it("maps legacy Client tab ids to licensor overview and companies tabs", () => {
    expect(normalizeLicensorLicenseeTab("company")).toBe("overview");
    expect(normalizeLicensorLicenseeTab("brand")).toBe("companies");
    expect(normalizeLicensorLicenseeTab(null)).toBe("overview");
  });
});
