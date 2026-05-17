import { describe, expect, it, vi } from "vitest";
import { createSupabaseMirrorClient } from "./supabase-client.js";
import { createPayloadSyncClient } from "./payload-client.js";

describe("LinkSites v2 capability adapters", () => {
  it("writes to Supabase mirror tables via REST", async () => {
    const fetchImpl = vi
      .fn<(input: URL | RequestInfo, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValue(new Response(null, { status: 201 }));

    const client = createSupabaseMirrorClient({
      fetchImpl,
      supabaseUrl: "http://127.0.0.1:54321",
      supabaseServiceRoleKey: "service-role-key",
      schema: "lsites_core",
      contentTable: "sites",
      assetTable: "media",
    });

    const content = await client.upsertSiteContent(
      "tenant-1",
      "site-1",
      "gen-1",
      { mirror_payload_ref: "payload:1" },
      "lease-1",
    );
    const assets = await client.upsertAssetRefs(
      "tenant-1",
      "site-1",
      [{ ref: "asset:1", kind: "image" }],
      "lease-1",
    );

    expect(content.mirrorWriteRef).toContain("supabase_mirror:tenant-1:site-1:gen-1");
    expect(content.revisionRef).toContain("supabase_mirror:tenant-1:site-1:gen-1");
    expect(assets.upsertedCount).toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("syncs to Payload and checks readiness", async () => {
    const fetchImpl = vi
      .fn<(input: URL | RequestInfo, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValue(new Response(JSON.stringify({ docs: [] }), { status: 200 }));

    const client = createPayloadSyncClient({
      fetchImpl,
      payloadBaseUrl: "http://127.0.0.1:3001",
      payloadApiKey: "payload-key",
      syncCollection: "site-settings",
      readinessCollection: "pages",
    });

    const sync = await client.syncFromMirror("supabase_mirror:tenant-1:site-1:gen-1", "site-1", "lease-2");
    const readiness = await client.checkReadiness(sync.payloadSyncRef, {
      requiredPages: ["home"],
      requiredNavigationItems: ["home"],
      requiredContentBlocks: ["hero"],
      requiredMediaRefs: ["asset:1"],
    });

    expect(sync.status).toBe("succeeded");
    expect(sync.documentRefs).toEqual(["site-1:home", "site-1:about", "site-1:contact"]);
    expect(readiness.checksPassed).toBe(true);
    expect(readiness.failedChecks).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
