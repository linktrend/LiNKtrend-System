"use client";

import Link from "next/link";
import { Bot, MessageSquare, Radio } from "lucide-react";

import { useAppSurface } from "@/components/app-surface-provider";
import { SettingCard } from "@/components/settings/setting-card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatUiLabel } from "@/lib/ui-standards";

/** Admin CEO binding → admin-openclaw (Wave 6.1). */
export function AdminCeoBindingCard() {
  const { href: appHref } = useAppSurface();

  return (
    <section className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900/40 dark:bg-violet-950/25">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatUiLabel("Vendor executive")}
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Bound to OpenClaw <span className="font-mono text-violet-800 dark:text-violet-300">admin-openclaw</span> —
            Zulip and inbox parity for operator messaging.
          </p>
        </div>
        <StatusPill label="CEO bound" tone="success" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SettingCard
          icon={Bot}
          title="LiNKbot sessions"
          description="Open fleet sessions for the vendor executive profile."
          actionLabel="Open sessions"
          href={appHref("/workers/admin-openclaw/sessions")}
        />
        <SettingCard
          icon={MessageSquare}
          title="Inbox"
          description="Operator inbox threads with admin-openclaw."
          actionLabel="Open inbox"
          href={appHref("/work/messages")}
        />
        <SettingCard
          icon={Radio}
          title="Zulip"
          description="Governed project messaging — dual-channel with inbox."
          actionLabel="Open work feed"
          href={appHref("/work")}
        />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        LiNKsuitegen orchestrator roles route through this profile. Factory analyst work uses{" "}
        <Link href={appHref("/workers")} className="font-medium text-violet-800 underline dark:text-violet-300">
          az-suitegen-factory
        </Link>{" "}
        (Agent Zero), not a separate OpenClaw factory bot.
      </p>
    </section>
  );
}
