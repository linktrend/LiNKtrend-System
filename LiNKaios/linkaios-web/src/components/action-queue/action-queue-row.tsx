"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import {
  actionQueueHoverClass,
  actionQueueStripeClass,
  type ActionQueueAccent,
} from "@/components/action-queue/action-queue-accent";
import { ACTION_QUEUE } from "@/lib/ui-standards";

export type ActionQueueRightAction = {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const ICON_ACTION_CLASS =
  "inline-flex h-4 w-4 shrink-0 items-center justify-center text-zinc-500 transition hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-400 dark:hover:text-zinc-100";

function ActionQueueRightActionButton(props: ActionQueueRightAction) {
  const Icon = props.icon;
  if (props.href && !props.disabled) {
    return (
      <Link href={props.href} aria-label={props.label} title={props.label} className={ICON_ACTION_CLASS}>
        <Icon className="h-4 w-4" aria-hidden />
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className={ICON_ACTION_CLASS}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function ActionQueueRow(props: {
  href?: string;
  onRowClick?: () => void;
  accent: ActionQueueAccent;
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  meta?: string;
  rightActions?: ActionQueueRightAction[];
}) {
  const stripe = actionQueueStripeClass(props.accent);
  const hover = actionQueueHoverClass(props.accent);
  const multiAction = (props.rightActions?.length ?? 0) > 0;

  const content = (
    <div className={ACTION_QUEUE.rowMain}>
      <div className={ACTION_QUEUE.rowTitleRow}>
        {props.icon}
        <span className="min-w-0 truncate">{props.title}</span>
      </div>
      <span className={ACTION_QUEUE.rowSubtitle}>{props.subtitle?.trim() ? props.subtitle : "\u00A0"}</span>
      <span className={ACTION_QUEUE.rowMeta}>{props.meta?.trim() ? props.meta : "\u00A0"}</span>
    </div>
  );

  if (multiAction) {
    return (
      <div
        className={[
          "flex items-stretch",
          ACTION_QUEUE.rowMinH,
          ACTION_QUEUE.rowMaxH,
          stripe,
          hover,
        ].join(" ")}
      >
        <div className={`${ACTION_QUEUE.rowLink} min-w-0 flex-1 cursor-default`}>{content}</div>
        <div className={`${ACTION_QUEUE.rowActionRail} items-center gap-3 px-3`}>
          {props.rightActions!.map((action) => (
            <ActionQueueRightActionButton key={action.label} {...action} />
          ))}
        </div>
      </div>
    );
  }

  const rowClass = [
    ACTION_QUEUE.rowLink,
    ACTION_QUEUE.rowMinH,
    ACTION_QUEUE.rowMaxH,
    stripe,
    hover,
  ].join(" ");

  if (props.href) {
    return (
      <Link href={props.href} className={rowClass}>
        {content}
      </Link>
    );
  }

  if (props.onRowClick) {
    return (
      <button type="button" onClick={props.onRowClick} className={`${rowClass} w-full cursor-pointer`}>
        {content}
      </button>
    );
  }

  return (
    <div className={rowClass} aria-disabled>
      {content}
    </div>
  );
}
