import { describe, expect, it } from "vitest";

import {
  discoverLinksitesTemplateRegistry,
  isKnownLinksitesTemplateId,
  matchTemplateFromRegistry,
} from "./linksites-registry.js";
import { selectTemplateFromRegistrySnapshot } from "./template-selection.js";

describe("LiNKsites external registry (LTS-103)", () => {
  it("loads static snapshot with marketing-smb-v1 from LiNKsites discovery", async () => {
    const registry = await discoverLinksitesTemplateRegistry();
    expect(registry.source).toBe("linksites_external");
    expect(registry.default_template_id).toBe("marketing-smb-v1");
    expect(isKnownLinksitesTemplateId("marketing-smb-v1", registry)).toBe(true);
    expect(isKnownLinksitesTemplateId("professional_v1", registry)).toBe(false);
  });

  it("matches dental industry to LiNKsites marketing-smb-v1 via industry_tags", () => {
    const registry = {
      source: "linksites_external" as const,
      discovery_mode: "static" as const,
      default_template_id: "marketing-smb-v1",
      templates: {
        "marketing-smb-v1": {
          id: "marketing-smb-v1",
          name: "Marketing SMB v1",
          industry_tags: ["dental", "professional"],
        },
      },
    };

    expect(
      matchTemplateFromRegistry({
        registry,
        industry: "Dental",
        business_type: "local_service",
      }),
    ).toBe("marketing-smb-v1");
  });
});

describe("LinkSites template selection (LTS-103)", () => {
  const staticRegistry = {
    source: "linksites_external" as const,
    discovery_mode: "static" as const,
    default_template_id: "marketing-smb-v1",
    templates: {
      "marketing-smb-v1": {
        id: "marketing-smb-v1",
        name: "Marketing SMB v1",
        industry_tags: ["dental", "professional", "local_service"],
      },
    },
  };

  it("selects template from external registry guidance by industry", () => {
    const record = selectTemplateFromRegistrySnapshot({
      tenant_id: "tenant-1",
      run_id: "run-1",
      industry: "Dental",
      qualification: { business_type: "local_service", industry: "Dental" },
      registry: staticRegistry,
    });

    expect(record.template_id).toBe("marketing-smb-v1");
    expect(record.template_name).toBe("Marketing SMB v1");
    expect(record.registry_source).toBe("linksites_external");
    expect(record.discovery_mode).toBe("static");
  });

  it("defaults to LiNKsites default template when industry is unknown", () => {
    const record = selectTemplateFromRegistrySnapshot({
      tenant_id: "tenant-1",
      run_id: "run-1",
      industry: "unknown_vertical",
      registry: staticRegistry,
    });

    expect(record.template_id).toBe("marketing-smb-v1");
  });
});
