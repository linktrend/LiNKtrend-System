import { describe, expect, it } from "vitest";

import { settingsHubTabLabel, visibleSettingsHubTabs } from "@/lib/settings-hub-tabs";

describe("visibleSettingsHubTabs", () => {
  it("shows Platform for licensor Super Admin on admin surface", () => {
    const tabs = visibleSettingsHubTabs(true, { kind: "licensor", role: "super_admin" });
    expect(tabs.map((tab) => tab.id)).toContain("platform");
  });

  it("shows Platform for licensor Admin on admin surface", () => {
    const tabs = visibleSettingsHubTabs(true, { kind: "licensor", role: "admin" });
    expect(tabs.map((tab) => tab.id)).toContain("platform");
  });

  it("hides Platform for licensor User tier", () => {
    const tabs = visibleSettingsHubTabs(true, { kind: "licensor", role: "user" });
    expect(tabs.map((tab) => tab.id)).not.toContain("platform");
    expect(tabs.map((tab) => tab.id)).toEqual(["account", "preferences"]);
  });

  it("hides Platform on licensee surface", () => {
    const tabs = visibleSettingsHubTabs(false, { kind: "licensee", role: "super_admin" });
    expect(tabs.map((tab) => tab.id)).not.toContain("platform");
  });

  it("labels licensor data tab without Integrations", () => {
    const tabs = visibleSettingsHubTabs(true, { kind: "licensor", role: "super_admin" });
    expect(tabs.find((tab) => tab.id === "data")?.label).toBe("Data");
    expect(settingsHubTabLabel("data", "licensor")).toBe("Data");
    expect(settingsHubTabLabel("data", "licensee")).toBe("Data & Integrations");
  });
});
