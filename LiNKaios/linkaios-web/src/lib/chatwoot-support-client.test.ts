import { describe, expect, it } from "vitest";

import {
  isChatwootSupportSyncConfigured,
  mapChatwootStatus,
  resolveChatwootSupportConfig,
} from "./chatwoot-support-client";

describe("isChatwootSupportSyncConfigured", () => {
  it("requires live mode and all chatwoot env vars", () => {
    expect(
      isChatwootSupportSyncConfigured({
        CHATWOOT_SUPPORT_SYNC_MODE: "live",
        CHATWOOT_BASE_URL: "https://chatwoot.example.com",
        CHATWOOT_ACCOUNT_ID: "1",
        CHATWOOT_API_ACCESS_TOKEN: "token",
        CHATWOOT_INBOX_ID: "2",
      } as never),
    ).toBe(true);
    expect(
      isChatwootSupportSyncConfigured({
        CHATWOOT_SUPPORT_SYNC_MODE: "off",
        CHATWOOT_BASE_URL: "https://chatwoot.example.com",
        CHATWOOT_ACCOUNT_ID: "1",
        CHATWOOT_API_ACCESS_TOKEN: "token",
        CHATWOOT_INBOX_ID: "2",
      } as never),
    ).toBe(false);
  });
});

describe("resolveChatwootSupportConfig", () => {
  it("returns normalized config when configured", () => {
    const config = resolveChatwootSupportConfig({
      CHATWOOT_SUPPORT_SYNC_MODE: "live",
      CHATWOOT_BASE_URL: "https://chatwoot.example.com/",
      CHATWOOT_ACCOUNT_ID: "1",
      CHATWOOT_API_ACCESS_TOKEN: "secret",
      CHATWOOT_INBOX_ID: "9",
    } as never);
    expect(config).toEqual({
      baseUrl: "https://chatwoot.example.com",
      accountId: "1",
      apiToken: "secret",
      inboxId: "9",
    });
  });
});

describe("mapChatwootStatus", () => {
  it("maps chatwoot statuses to support ticket statuses", () => {
    expect(mapChatwootStatus("resolved")).toBe("resolved");
    expect(mapChatwootStatus("pending")).toBe("in_progress");
    expect(mapChatwootStatus("open")).toBe("open");
  });
});
