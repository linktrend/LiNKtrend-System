import { describe, expect, it } from "vitest";

import { buildChatwootConversationUrl, normalizeChatwootPublicUrl, resolveChatwootPublicUrl } from "./chatwoot-links";

describe("chatwoot-links", () => {
  it("normalizes public Chatwoot origins", () => {
    expect(normalizeChatwootPublicUrl("https://chatwoot.linktrend.internal/")).toBe(
      "https://chatwoot.linktrend.internal",
    );
    expect(normalizeChatwootPublicUrl("")).toBeNull();
  });

  it("builds conversation popup URLs", () => {
    expect(
      buildChatwootConversationUrl("https://chatwoot.linktrend.internal", "1", "42"),
    ).toBe("https://chatwoot.linktrend.internal/app/accounts/1/conversations/42");
  });

  it("prefers CHATWOOT_PUBLIC_URL over internal API base", () => {
    expect(
      resolveChatwootPublicUrl({
        CHATWOOT_PUBLIC_URL: "https://chatwoot.linktrend.internal",
        CHATWOOT_BASE_URL: "http://chatwoot-rails-1:3000",
      }),
    ).toBe("https://chatwoot.linktrend.internal");
  });
});
