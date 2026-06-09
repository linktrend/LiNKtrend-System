import { describe, expect, it } from "vitest";

import { buildZulipThreadUrl, encodeZulipHashOperand, normalizeZulipSiteUrl } from "./zulip-links";

describe("encodeZulipHashOperand", () => {
  it("encodes spaces and punctuation per Zulip rules", () => {
    expect(encodeZulipHashOperand("fun")).toBe("fun");
    expect(encodeZulipHashOperand("hello world")).toBe("hello.2E20world");
  });
});

describe("buildZulipThreadUrl", () => {
  it("builds topic narrow URLs", () => {
    expect(buildZulipThreadUrl("https://chat.example.com", { streamId: 42, topic: "deployment" })).toBe(
      "https://chat.example.com/#narrow/channel/42/topic/deployment",
    );
  });

  it("builds message permalink URLs with with/ operator", () => {
    expect(
      buildZulipThreadUrl("https://chat.example.com/", {
        streamId: 42,
        topic: "deployment",
        messageId: 991,
      }),
    ).toBe("https://chat.example.com/#narrow/channel/42/topic/deployment/with/991");
  });

  it("returns null when site URL is invalid", () => {
    expect(buildZulipThreadUrl("", { streamId: 1, topic: "x" })).toBeNull();
  });
});

describe("normalizeZulipSiteUrl", () => {
  it("strips trailing slash from origin", () => {
    expect(normalizeZulipSiteUrl("https://org.zulipchat.com/")).toBe("https://org.zulipchat.com");
  });
});
