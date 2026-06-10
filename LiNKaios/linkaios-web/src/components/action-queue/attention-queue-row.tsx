"use client";

import { AlertTriangle, Brain, MessageSquare, Radio } from "lucide-react";

import {
  accentFromAttentionItem,
  actionQueueIconClass,
} from "@/components/action-queue/action-queue-accent";
import {
  ActionQueueRow,
} from "@/components/action-queue/action-queue-row";
import { useAppSurface } from "@/components/app-surface-provider";
import { FixturePill } from "@/components/fixture-pill";
import { isUiMockAttentionItem } from "@/lib/ui-mocks/fixture-provenance";
import type { AttentionFeedItem } from "@/lib/work-attention-feed";
import { sanitizeAttentionHref } from "@/lib/work-attention-feed-routing";

function queueItemIcon(item: AttentionFeedItem) {
  const accent = accentFromAttentionItem(item);
  const iconClass = actionQueueIconClass(accent);
  if (item.kind === "alert") {
    return <AlertTriangle className={iconClass} aria-hidden />;
  }
  if (item.kind === "message") {
    return <MessageSquare className={iconClass} aria-hidden />;
  }
  if (item.kind === "session") {
    return <Radio className={iconClass} aria-hidden />;
  }
  return <Brain className={iconClass} aria-hidden />;
}

/** Action Queue row for All Work / Overview attention feed. */
export function AttentionQueueRow(props: { item: AttentionFeedItem }) {
  const { item } = props;
  const { href: appHref } = useAppSurface();
  const showFixture = isUiMockAttentionItem(item);
  const rowHref = appHref(sanitizeAttentionHref(item.href, "/work"));
  return (
    <ActionQueueRow
      href={rowHref}
      accent={accentFromAttentionItem(item)}
      icon={queueItemIcon(item)}
      title={
        showFixture ? (
          <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate">{item.title}</span>
            <FixturePill />
          </span>
        ) : (
          item.title
        )
      }
      subtitle={item.subtitle ?? "\u00A0"}
      meta={item.typeLabel}
    />
  );
}
