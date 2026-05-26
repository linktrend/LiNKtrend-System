import Link from "next/link";
import { Brain, Key, Link2, Wrench, type LucideIcon } from "lucide-react";

import { TitledCardHeader } from "@/components/titled-card-header";
import type {
  CapabilitiesHubSliceStats,
  ConnectorsHubStats,
  LeasesHubStats,
} from "@/lib/capabilities-slice-stats";
import {
  hubCatalogStatLines,
  hubConnectorStatLines,
  hubLeaseStatLines,
} from "@/lib/capabilities-slice-stats";
import { BUTTON, CARD } from "@/lib/ui-standards";

export type { CapabilitiesHubSliceStats, ConnectorsHubStats, LeasesHubStats } from "@/lib/capabilities-slice-stats";

function StatLine(props: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-800/80">
      <span className="text-zinc-600 dark:text-zinc-400">{props.label}</span>
      <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">{props.value}</span>
    </div>
  );
}

function HubSliceCard(props: {
  icon: LucideIcon;
  title: string;
  description: string;
  lines: { label: string; value: number }[];
  href: string;
  actionLabel: string;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader icon={props.icon} title={props.title} description={props.description} />
      <div className={`mt-4 flex-1 ${CARD.contentInset}`}>
        {props.lines.map((line) => (
          <StatLine key={line.label} label={line.label} value={line.value} />
        ))}
      </div>
      <Link href={props.href} className={`${BUTTON.secondaryCardAction} mt-6`}>
        {props.actionLabel}
      </Link>
    </article>
  );
}

export function CapabilitiesHubCards(props: {
  skills: CapabilitiesHubSliceStats;
  tools: CapabilitiesHubSliceStats;
  connectors: ConnectorsHubStats;
  leases: LeasesHubStats;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <HubSliceCard
        icon={Brain}
        title="Skills"
        description="Packaged procedures that call governed tools and capabilities at runtime."
        lines={hubCatalogStatLines(props.skills)}
        href="/skills/skills"
        actionLabel="Open Skills catalogue"
      />
      <HubSliceCard
        icon={Wrench}
        title="Tools"
        description="Callable integrations and actions executed through approved capability governance."
        lines={hubCatalogStatLines(props.tools)}
        href="/skills/tools"
        actionLabel="Open Tools catalogue"
      />
      <HubSliceCard
        icon={Link2}
        title="Capabilities"
        description="Governed bridges to external software — Odoo, Plane, Payload, Zulip, and the capability registry."
        lines={hubConnectorStatLines(props.connectors)}
        href="/skills/connectors"
        actionLabel="Open capabilities catalogue"
      />
      <HubSliceCard
        icon={Key}
        title="Leases"
        description="Time-scoped grants for capabilities, tools, and side effects — plus kill switches and approval posture."
        lines={hubLeaseStatLines(props.leases)}
        href="/skills/leases"
        actionLabel="Open leases"
      />
    </div>
  );
}
