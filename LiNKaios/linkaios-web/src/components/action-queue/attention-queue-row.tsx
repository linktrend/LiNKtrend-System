"use client";

import { AlertTriangle, Brain, MessageSquare, Radio } from "lucide-react";

import {
  accentFromAttentionItem,
  actionQueueIconClass,
} from "@/components/action-queue/action-queue-accent";
import { ActionQueueRow } from "@/components/action-queue/action-queue-row";
import type { AttentionFeedItem } from "@/lib/work-attention-feed";

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
  return (
    <ActionQueueRow
      href={item.href}
      accent={accentFromAttentionItem(item)}
      icon={queueItemIcon(item)}
      title={item.title}
      subtitle={item.subtitle ?? "\u00A0"}
      meta={item.typeLabel}
    />
  );
}
