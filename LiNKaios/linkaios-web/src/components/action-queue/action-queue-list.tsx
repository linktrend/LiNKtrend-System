"use client";

import { ACTION_QUEUE } from "@/lib/ui-standards";

export function ActionQueueList(props: {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}) {
  const listClass = [
    ACTION_QUEUE.list,
    props.scrollable !== false ? ACTION_QUEUE.listScroll : "",
    props.className,
  ]
    .filter(Boolean)
    .join(" ");

  return <ul className={listClass}>{props.children}</ul>;
}
