import { describe, expect, it } from "vitest";

import { ADMIN_SCOPE, ALL_LICENSEES_SCOPE, PLATFORM_ALL_SCOPE } from "@/lib/app-roles";
import { LICENSOR_TENANT_ID_FALLBACK } from "@/lib/licensor-view-scope";
import {
  enrichChannelThreadsWithTenantKey,
  filterChannelThreadsForViewScope,
  type ChannelMessageThread,
} from "@/lib/work-messages";

function thread(id: string, missionId: string | null, tenantKey?: string | null): ChannelMessageThread {
  return {
    id,
    channel: "Zulip",
    channelTag: "Zulip",
    subject: "general",
    preview: "Hello",
    lastActivity: "2026-06-01T12:00:00.000Z",
    detail: "",
    missionId,
    tenantKey,
    messageCount: 1,
    messages: [],
    openHref: "/work/messages",
  };
}

describe("work messages view scope", () => {
  it("enriches tenant keys from mission tenant map", () => {
    const enriched = enrichChannelThreadsWithTenantKey(
      [thread("t1", "mission-1")],
      { "mission-1": "xyz-marketing" },
      LICENSOR_TENANT_ID_FALLBACK,
    );
    expect(enriched[0]?.tenantKey).toBe("xyz-marketing");
  });

  it("filters threads by admin view scope", () => {
    const threads = [
      thread("admin", "m1", LICENSOR_TENANT_ID_FALLBACK),
      thread("licensee", "m2", "xyz-marketing"),
    ];
    expect(filterChannelThreadsForViewScope(PLATFORM_ALL_SCOPE, threads)).toEqual(threads);
    expect(filterChannelThreadsForViewScope(ADMIN_SCOPE, threads, LICENSOR_TENANT_ID_FALLBACK)).toEqual([threads[0]]);
    expect(filterChannelThreadsForViewScope(ALL_LICENSEES_SCOPE, threads, LICENSOR_TENANT_ID_FALLBACK)).toEqual([
      threads[1],
    ]);
    expect(filterChannelThreadsForViewScope("xyz-marketing", threads, LICENSOR_TENANT_ID_FALLBACK)).toEqual([
      threads[1],
    ]);
  });
});
