import { describe, expect, it } from "vitest";
import type { Env } from "@linktrend/shared-config";
import type { DispatchContext } from "./types";
import {
  buildChatwootReadinessTracePayload,
  buildPreviewPublishAdapter,
  resolveChatwootReadinessTimeoutMs,
  resolvePreviewPublishMode,
} from "./dispatch";

const ctx: DispatchContext = {
  tenant_id: "tenant-1",
  run_id: "run-1",
  stage_id: "preview_publish",
  plugin_id: "websitefactory",
  attempt: 1,
};

function envWith(overrides: Partial<Env>): Env {
  return {
    ...overrides,
  } as Env;
}

describe("preview publish adapter", () => {
  it("runs read-only DigitalOcean readiness check before hosted preview output", async () => {
    const originalFetch = global.fetch;
    const fetchMock = async () => new Response(JSON.stringify({ app: { id: "app-id" } }), { status: 200 });
    global.fetch = fetchMock as typeof global.fetch;
    try {
      const env = envWith({
        PREVIEW_PUBLISH_MODE: "digitalocean",
        PREVIEW_PUBLISH_DIGITALOCEAN_ENABLED: "1",
        DIGITALOCEAN_ACCESS_TOKEN: "token",
        DIGITALOCEAN_APP_ID: "app-id",
        DIGITALOCEAN_PREVIEW_BASE_URL: "https://preview.example.com",
      });

      const adapter = buildPreviewPublishAdapter(env, ctx);
      const result = await adapter.publish();

      expect(adapter.mode).toBe("digitalocean");
      expect(result.success).toBe(true);
      expect(result.outputs?.preview_url).toBe("https://preview.example.com/preview/tenant-1/run-1");
      expect(result.outputs?.preview_artifact_ref).toBe("storage://previews/run-1.zip");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("defaults to static mode when preview mode is unset", async () => {
    const env = envWith({
      LINKTREND_PUBLIC_BASE_URL: "http://localhost:3000",
    });

    expect(resolvePreviewPublishMode(env)).toBe("static");

    const adapter = buildPreviewPublishAdapter(env, ctx);
    const result = await adapter.publish();

    expect(adapter.mode).toBe("static");
    expect(result.success).toBe(true);
    expect(result.outputs?.preview_url).toBe("http://localhost:3000/preview/tenant-1/run-1");
    expect(result.outputs?.preview_artifact_ref).toBe("storage://previews/run-1.zip");
  });

  it("keeps digitalocean mode disabled unless explicitly enabled", async () => {
    const env = envWith({
      PREVIEW_PUBLISH_MODE: "digitalocean",
      PREVIEW_PUBLISH_DIGITALOCEAN_ENABLED: "0",
      DIGITALOCEAN_ACCESS_TOKEN: "token",
      DIGITALOCEAN_APP_ID: "app-id",
      DIGITALOCEAN_PREVIEW_BASE_URL: "https://preview.example.com",
    });

    expect(resolvePreviewPublishMode(env)).toBe("digitalocean");

    const adapter = buildPreviewPublishAdapter(env, ctx);
    const result = await adapter.publish();

    expect(adapter.mode).toBe("digitalocean");
    expect(result.success).toBe(false);
    expect(result.failure?.code).toBe("INTEGRATION_UNAVAILABLE");
    expect(result.outputs).toBeUndefined();
  });

  it("maps DigitalOcean readiness auth failures to canonical integration codes", async () => {
    const originalFetch = global.fetch;
    const fetchMock = async () => new Response(JSON.stringify({ id: "unauthorized" }), { status: 401 });
    global.fetch = fetchMock as typeof global.fetch;
    try {
      const env = envWith({
        PREVIEW_PUBLISH_MODE: "digitalocean",
        PREVIEW_PUBLISH_DIGITALOCEAN_ENABLED: "1",
        DIGITALOCEAN_ACCESS_TOKEN: "token",
        DIGITALOCEAN_APP_ID: "app-id",
        DIGITALOCEAN_PREVIEW_BASE_URL: "https://preview.example.com",
      });

      const adapter = buildPreviewPublishAdapter(env, ctx);
      const result = await adapter.publish();

      expect(result.success).toBe(false);
      expect(result.failure?.code).toBe("INTEGRATION_AUTH_FAILED");
      expect(result.outputs).toBeUndefined();
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("chatwoot readiness timeout config", () => {
  it("uses safe default when timeout env is unset or invalid", () => {
    expect(resolveChatwootReadinessTimeoutMs(envWith({}))).toBe(5000);
    expect(resolveChatwootReadinessTimeoutMs(envWith({ CHATWOOT_READINESS_TIMEOUT_MS: "0" }))).toBe(5000);
    expect(resolveChatwootReadinessTimeoutMs(envWith({ CHATWOOT_READINESS_TIMEOUT_MS: "abc" }))).toBe(5000);
  });

  it("uses configured timeout and clamps to max", () => {
    expect(resolveChatwootReadinessTimeoutMs(envWith({ CHATWOOT_READINESS_TIMEOUT_MS: "7500" }))).toBe(7500);
    expect(resolveChatwootReadinessTimeoutMs(envWith({ CHATWOOT_READINESS_TIMEOUT_MS: "999999" }))).toBe(60000);
  });
});

describe("chatwoot readiness trace payload", () => {
  it("does not include token or credentialed URL", () => {
    const secret = "super-secret-token";
    const payload = buildChatwootReadinessTracePayload({
      env: envWith({
        CRM_PROVIDER: "chatwoot",
        CRM_MODE: "shadow_readiness",
        CHATWOOT_BASE_URL: "https://user:pass@chatwoot.example.com",
        CHATWOOT_ACCOUNT_ID: "42",
        CHATWOOT_API_ACCESS_TOKEN: secret,
      }),
      outcome: "auth_failed",
      success: false,
      timeout_ms: 5000,
      duration_ms: 123,
      http_status: 401,
      error_name: "AuthError",
    });

    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain("user:pass");
    expect(payload).toMatchObject({
      integration: "chatwoot",
      base_url_origin: "https://chatwoot.example.com",
      token_configured: true,
      account_id_configured: true,
      http_status: 401,
    });
  });
});
