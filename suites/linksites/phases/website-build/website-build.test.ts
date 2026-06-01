import { describe, expect, it } from "vitest";

import { buildWebsiteHandoff } from "./website-build.js";

describe("LinkSites website build (LTS-104)", () => {
  it("hands website package to autowork artifact path", () => {
    const handoff = buildWebsiteHandoff({
      tenant_id: "tenant-1",
      run_id: "run-1",
      template_id: "professional_v1",
      website_package: { copy: { hero_headline: "Welcome" } },
    });

    expect(handoff.artifact_bundle_ref).toBe("bundle:tenant-1:run-1");
    expect(handoff.website_package).toHaveProperty("copy");
  });
});
