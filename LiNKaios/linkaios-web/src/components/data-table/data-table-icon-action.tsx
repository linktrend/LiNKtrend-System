"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const ICON_CLASS =
  "inline-flex h-4 w-4 shrink-0 items-center justify-center text-zinc-600 transition hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-400 dark:hover:text-zinc-100";

const ICON_DANGER_CLASS =
  "inline-flex h-4 w-4 shrink-0 items-center justify-center text-red-600 transition hover:text-red-800 disabled:pointer-events-none disabled:opacity-40 dark:text-red-400 dark:hover:text-red-300";

export function DataTableIconAction(props: {
  icon: LucideIcon;
  label: string;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  tone?: "default" | "danger";
}) {
  const Icon = props.icon;
  const className = props.tone === "danger" ? ICON_DANGER_CLASS : ICON_CLASS;

  if (props.href && !props.disabled) {
    const external = /^https?:\/\//i.test(props.href);
    if (external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={props.label}
          title={props.label}
          className={className}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </a>
      );
    }
    return (
      <Link href={props.href} aria-label={props.label} title={props.label} className={className}>
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
      className={className}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
