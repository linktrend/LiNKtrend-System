import { describe, expect, it } from "vitest";

import { resolveMemorySharingPolicy } from "@/lib/memory-sharing-policy";

describe("resolveMemorySharingPolicy", () => {
  it("single entity single brand — brand home only", () => {
    const p = resolveMemorySharingPolicy({ topology: "single_entity_single_brand" });
    expect(p.homePartition).toBe("brand");
    expect(p.readTiers).toEqual(["brand"]);
  });

  it("single entity many brands — share within legal entity", () => {
    const p = resolveMemorySharingPolicy({ topology: "single_entity_many_brands" });
    expect(p.readTiers).toEqual(["brand", "legal_entity"]);
  });

  it("many entities — share within licensee by default", () => {
    const p = resolveMemorySharingPolicy({ topology: "many_entities_many_brands" });
    expect(p.readTiers).toContain("licensee");
  });

  it("many entities with strict client walls — no licensee pool", () => {
    const p = resolveMemorySharingPolicy({
      topology: "many_entities_many_brands",
      strictClientWalls: true,
    });
    expect(p.readTiers).not.toContain("licensee");
  });

  it("legal industry disables cross-licensee anonymized default", () => {
    const p = resolveMemorySharingPolicy({
      topology: "many_entities_many_brands",
      industryLabel: "Legal",
    });
    expect(p.crossLicenseeAnonymized).toBe(false);
  });

  it("marketing industry enables cross-licensee anonymized default", () => {
    const p = resolveMemorySharingPolicy({
      topology: "single_entity_single_brand",
      industryLabel: "Marketing agency",
    });
    expect(p.crossLicenseeAnonymized).toBe(true);
  });
});
