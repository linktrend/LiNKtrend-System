"use client";

import Link from "next/link";
import { useRef } from "react";
import { Building2, FolderKanban, Layers, Pencil, Shield, Smartphone, Workflow } from "lucide-react";

import type { OperatorAccessScope } from "@/lib/operator-access-scope";
import { PROFILE_CARD } from "@/lib/ui-standards";

type OperatorProfileHeroProps = {
  fullName: string;
  username: string;
  avatarUrl: string | null;
  initials: string;
  email: string;
  phoneDisplay: string;
  timezoneLabel: string;
  locationLabel: string;
  statusLabel: string;
  accessScope: OperatorAccessScope;
  twoFactorEnabled?: boolean;
  activeSessionCount?: number;
  onAvatarUpload: (file: File) => void;
};

function HeroMetric(props: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  href?: string;
  valueClassName?: string;
}) {
  const tile = (
    <div
      className={`${PROFILE_CARD.metricTile} ${props.href ? "transition hover:border-zinc-300 hover:bg-zinc-100/80 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={PROFILE_CARD.metricLabel}>{props.label}</p>
        <span className="shrink-0 text-zinc-400 dark:text-zinc-500">{props.icon}</span>
      </div>
      <p className={props.valueClassName ?? PROFILE_CARD.metricValue}>{props.value}</p>
    </div>
  );

  if (props.href) {
    return (
      <Link
        href={props.href}
        className="block h-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        {tile}
      </Link>
    );
  }

  return <div className="h-full">{tile}</div>;
}

function MetaItem(props: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
  valuePrefix?: React.ReactNode;
}) {
  return (
    <div className={`space-y-0.5 ${props.className ?? ""}`.trim()}>
      <p className={PROFILE_CARD.metaLabel}>{props.label}</p>
      <p
        className={`${PROFILE_CARD.metaValue} ${props.valuePrefix ? "flex items-center gap-1.5" : ""} ${props.valueClassName ?? ""}`.trim()}
      >
        {props.valuePrefix}
        {props.value}
      </p>
    </div>
  );
}

export function OperatorProfileHero(props: OperatorProfileHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className={PROFILE_CARD.heroShell}>
      <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between xl:gap-10">
        <div className="flex min-w-0 flex-1 items-start gap-8">
          <div className="relative shrink-0">
            <div className="group relative h-28 w-28 overflow-hidden rounded-full border border-zinc-200/80 bg-zinc-100 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              {props.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={props.avatarUrl} alt={props.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-zinc-600 dark:text-zinc-300">
                  {props.initials}
                </span>
              )}
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-zinc-900/45 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                onClick={() => inputRef.current?.click()}
                aria-label="Change photo"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-zinc-900/80 text-white shadow-sm">
                  <Pencil className="h-4 w-4" aria-hidden />
                </span>
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) props.onAvatarUpload(file);
                event.target.value = "";
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
              {props.fullName}
            </h1>

            <div className={`mt-3 ${PROFILE_CARD.heroMetaColumns}`}>
              <div className={PROFILE_CARD.heroMetaStack}>
                <MetaItem label="Username" value={props.username} />
                <MetaItem label="Email" value={props.email} />
                <MetaItem label="Timezone" value={props.timezoneLabel} />
              </div>
              <div className={PROFILE_CARD.heroMetaStack}>
                <MetaItem
                  label="Status"
                  value={props.statusLabel}
                  valuePrefix={
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950"
                      aria-hidden
                    />
                  }
                />
                <MetaItem label="Phone" value={props.phoneDisplay} />
                <MetaItem
                  label="Location"
                  value={props.locationLabel}
                  valueClassName="max-w-[11rem] whitespace-pre-line leading-snug"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={PROFILE_CARD.heroStatsGrid}>
          <HeroMetric
            label="Companies"
            value={props.accessScope.companies.length}
            icon={<Building2 className="h-3.5 w-3.5" aria-hidden />}
          />
          <HeroMetric
            label="Projects"
            value={props.accessScope.projects.length}
            icon={<FolderKanban className="h-3.5 w-3.5" aria-hidden />}
          />
          <HeroMetric
            label="Suites"
            value={props.accessScope.modules.length}
            icon={<Layers className="h-3.5 w-3.5" aria-hidden />}
          />
          <HeroMetric
            label="Modules"
            value={props.accessScope.processes.length}
            icon={<Workflow className="h-3.5 w-3.5" aria-hidden />}
          />
          <HeroMetric
            label="2FA"
            href="/settings/two-factor"
            value={props.twoFactorEnabled ? "Enabled" : "Not Enabled"}
            valueClassName={
              props.twoFactorEnabled
                ? `${PROFILE_CARD.metricValueStatus} text-emerald-600 dark:text-emerald-400`
                : `${PROFILE_CARD.metricValueStatus} text-amber-600 dark:text-amber-400`
            }
            icon={<Smartphone className="h-3.5 w-3.5" aria-hidden />}
          />
          <HeroMetric
            label="Sessions"
            href="/settings/sessions"
            value={props.activeSessionCount ?? 2}
            icon={<Shield className="h-3.5 w-3.5" aria-hidden />}
          />
        </div>
      </div>
    </section>
  );
}
