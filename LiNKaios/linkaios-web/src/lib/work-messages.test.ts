import { describe, expect, it } from "vitest";

import {
  formatChannelThreadAttentionSubtitle,
  formatChannelThreadAttentionTitle,
  groupZulipIntoThreads,
  type ChannelMessageThread,
} from "./work-messages";

describe("groupZulipIntoThreads", () => {
  it("uses topic as thread subject and humanizes payload preview", () => {
    const threads = groupZulipIntoThreads(
      [
        {
          id: "1",
          stream_id: 5,
          topic: "general",
          mission_id: null,
          payload: { content: "Deploy finished successfully." },
          created_at: "2026-06-01T12:00:00.000Z",
          zulip_message_id: "101",
        },
      ],
      { zulipSiteUrl: "https://zulip.linktrend.internal" },
    );

    expect(threads).toHaveLength(1);
    expect(threads[0]?.subject).toBe("general");
    expect(threads[0]?.preview).toBe("Deploy finished successfully.");
    expect(threads[0]?.openHref).toContain("https://zulip.linktrend.internal/");
  });

  it("does not JSON-stringify opaque payloads in preview", () => {
    const threads = groupZulipIntoThreads(
      [
        {
          id: "2",
          stream_id: 5,
          topic: "ops",
          mission_id: null,
          payload: { cadence: "once", suite_id: "linksites", tenant_id: "tenant-1" },
          created_at: "2026-06-01T12:00:00.000Z",
          zulip_message_id: "102",
        },
      ],
      { zulipSiteUrl: null },
    );

    expect(threads[0]?.preview).toBe("Suite linksites");
  });
});

describe("formatChannelThreadAttentionTitle", () => {
  it("formats Zulip threads with topic-first labels", () => {
    const thread: ChannelMessageThread = {
      id: "zulip-1",
      channel: "Zulip",
      channelTag: "Zulip",
      subject: "general",
      preview: "Hello",
      lastActivity: "2026-06-01T12:00:00.000Z",
      detail: "",
      messageCount: 1,
      messages: [],
      topic: "general",
      openHref: "https://zulip.linktrend.internal/#narrow/channel/5/topic/general",
    };

    expect(formatChannelThreadAttentionTitle(thread)).toBe("Zulip · general");
  });
});

describe("formatChannelThreadAttentionSubtitle", () => {
  it("hides JSON-looking previews from the action queue", () => {
    const thread: ChannelMessageThread = {
      id: "zulip-2",
      channel: "Zulip",
      channelTag: "Zulip",
      subject: "ops",
      preview: '{"cadence":"once","suite_id":"linksites"}',
      lastActivity: "2026-06-01T12:00:00.000Z",
      detail: "",
      messageCount: 1,
      messages: [],
      openHref: "",
    };

    expect(formatChannelThreadAttentionSubtitle(thread)).toBe("Open thread for message detail.");
  });
});
