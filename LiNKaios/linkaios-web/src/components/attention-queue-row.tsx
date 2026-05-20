import Link from "next/link";
import { AlertTriangle, Brain, MessageSquare, Radio } from "lucide-react";

import {
  queueItemIconClass,
  queueRowHoverClass,
  queueRowShellClass,
} from "@/lib/attention-queue-row-styles";
import type { AttentionFeedItem } from "@/lib/work-attention-feed";

/** Action queue row — coloured left stripe, type icon, hover tint (All Work pattern). */
export function AttentionQueueRow(props: { item: AttentionFeedItem }) {
  const { item } = props;
  const iconClass = queueItemIconClass(item);

  return (
    <Link
      href={item.href}
      className={
        "flex flex-col gap-1 px-4 py-3 text-sm transition " +
        queueRowShellClass(item) +
        " " +
        queueRowHoverClass(item)
      }
    >
      <span className="flex items-start gap-2 font-medium text-zinc-900 dark:text-zinc-100">
        {item.kind === "alert" ? (
          <AlertTriangle className={iconClass} aria-hidden />
        ) : item.kind === "message" ? (
          <MessageSquare className={iconClass} aria-hidden />
        ) : item.kind === "session" ? (
          <Radio className={iconClass} aria-hidden />
        ) : (
          <Brain className={iconClass} aria-hidden />
        )}
        <span className="min-w-0">{item.title}</span>
      </span>
      {item.subtitle ? (
        <span className="line-clamp-2 pl-6 text-xs text-zinc-600 dark:text-zinc-400">{item.subtitle}</span>
      ) : null}
    </Link>
  );
}
