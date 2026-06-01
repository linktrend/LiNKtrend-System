import { describe, expect, it } from "vitest";

import { buildPublishRecord, buildTempPublishUrl, executeMvoPublish } from "./publish.js";

describe("LinkSites publish (LTS-105)", () => {
  it("builds temp URL on linktrend.media", () => {
    expect(buildTempPublishUrl({ business_slug: "Acme Dental" })).toBe(
      "https://acme-dental.linktrend.media",
    );
  });

  it("records publish with payload sync ref and readiness status", () => {
    const record = buildPublishRecord({
      tenant_id: "tenant-1",
      run_id: "run-1",
      business_slug: "demo-lead",
      payload_sync_ref: "payload_sync:tenant-1:site-1:gen-1",
      preview_readiness_status: "ready",
    });

    expect(record.temp_url).toContain(".linktrend.media");
    expect(record.preview_readiness_status).toBe("ready");
    expect(record.payload_document_refs.length).toBeGreaterThan(0);
    expect(record.mvo_equivalent).toBe(true);
  });

  it("blocks publish when preview readiness failed", () => {
    const result = executeMvoPublish({
      tenant_id: "tenant-1",
      run_id: "run-1",
      business_slug: "demo-lead",
      payload_sync_ref: "payload_sync:tenant-1:site-1:gen-1",
      payload_sync_status: "succeeded",
      payload_document_refs: ["payload:home"],
      preview_readiness_status: "failed",
    });

    expect(result).toEqual({
      blocked: true,
      reason: "preview_readiness_status must be ready before publish",
    });
  });

  it("blocks publish without payload sync proof", () => {
    const result = executeMvoPublish({
      tenant_id: "tenant-1",
      run_id: "run-1",
      business_slug: "demo-lead",
      payload_sync_ref: "invalid",
      payload_sync_status: "succeeded",
      payload_document_refs: ["payload:home"],
      preview_readiness_status: "ready",
    });

    expect(result).toMatchObject({ blocked: true });
  });
});
