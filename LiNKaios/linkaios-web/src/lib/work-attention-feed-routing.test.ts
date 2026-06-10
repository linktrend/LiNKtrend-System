import { describe, expect, it } from "vitest";

import {
  isInternalAttentionHref,
  sanitizeAttentionHref,
  workMessagesThreadHref,
} from "@/lib/work-attention-feed-routing";
import type { ChannelMessageThread } from "@/lib/work-messages";

describe("work-attention-feed-routing", () => {
  it("rejects external hrefs for action queue navigation", () => {
    expect(isInternalAttentionHref("https://zulip.example/#narrow")).toBe(false);
    expect(isInternalAttentionHref("/work/messages")).toBe(true);
  });

  it("sanitizes external targets to in-app fallbacks", () => {
    expect(sanitizeAttentionHref("https://zulip.example/thread", "/work/messages")).toBe("/work/messages");
    expect(sanitizeAttentionHref("/work/alerts", "/work")).toBe("/work/alerts");
  });

  it("builds Work → Messages deep links for Zulip threads", () => {
    const thread: ChannelMessageThread = {
      id: "zulip-stream-5-topic-general",
      channel: "Zulip",
      channelTag: "Zulip",
      subject: "general",
      preview: "Hello",
      lastActivity: "2026-06-01T12:00:00.000Z",
      detail: "",
      messageCount: 1,
      messages: [],
      openHref: "https://zulip.example/#narrow",
    };

    expect(workMessagesThreadHref(thread)).toBe(
      "/work/messages?thread=zulip-stream-5-topic-general",
    );
  });
});
