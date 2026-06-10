import { describe, expect, it } from "vitest";

import { buildAttentionFeed } from "@/lib/work-attention-feed";
import type { ChannelMessageThread } from "@/lib/work-messages";

describe("buildAttentionFeed", () => {
  it("routes message rows to Work → Messages instead of external Zulip URLs", () => {
    const thread: ChannelMessageThread = {
      id: "zulip-99",
      channel: "Zulip",
      channelTag: "Zulip",
      subject: "ops",
      topic: "ops",
      preview: "Deploy finished",
      lastActivity: "2026-06-10T12:00:00.000Z",
      detail: "",
      messageCount: 1,
      messages: [],
      openHref: "https://zulip.linktrend.internal/#narrow/channel/5",
    };

    const feed = buildAttentionFeed({
      alerts: [],
      messages: [thread],
      sessions: [],
      brainDraftCount: 0,
    });

    expect(feed[0]?.href).toBe("/work/messages?thread=zulip-99");
  });
});
