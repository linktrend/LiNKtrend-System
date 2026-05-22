import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { TitledCardHeader } from "@/components/titled-card-header";
import { BUTTON } from "@/lib/ui-standards";

export type SettingCardFactRow = {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
};

export function SettingCardFacts(props: { rows: SettingCardFactRow[] }) {
  return (
    <dl className="space-y-1 text-sm">
      {props.rows.map((row) => (
        <div key={row.label} className="flex gap-3">
          <dt className="w-[7.5rem] shrink-0 text-zinc-600 dark:text-zinc-400">{row.label}:</dt>
          <dd
            className={`min-w-0 flex-1 ${row.strong ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export type SettingCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  onClick?: () => void;
  titleAction?: React.ReactNode;
  children?: React.ReactNode;
  locked?: boolean;
  lockedHint?: string;
};

export function SettingCard(props: SettingCardProps) {
  const actionClass = `${BUTTON.secondaryCardAction} mt-6`;
  const Icon = props.icon;

  return (
    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader
        icon={Icon}
        title={props.title}
        description={props.description}
        action={props.titleAction}
        flushContent
      />

      {props.children ? (
        <div className="mt-4 flex-1">{props.children}</div>
      ) : props.locked && props.lockedHint ? (
        <p className="mt-4 flex-1 text-sm text-zinc-600 dark:text-zinc-400">{props.lockedHint}</p>
      ) : (
        <div className="flex-1" />
      )}

      {props.locked ? (
        <span className={`${actionClass} cursor-not-allowed opacity-60`} aria-disabled="true">
          {props.actionLabel}
        </span>
      ) : props.href ? (
        <Link href={props.href} className={actionClass}>
          {props.actionLabel}
        </Link>
      ) : (
        <button type="button" onClick={props.onClick ?? (() => {})} className={actionClass}>
          {props.actionLabel}
        </button>
      )}
    </article>
  );
}

export function VendorOnlyBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      Vendor only
    </span>
  );
}
