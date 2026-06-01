import {
  FlaskConical,
  Route,
  ScrollText,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { SettingCard } from "@/components/settings/setting-card";
import { StubBadge } from "@/components/stub-badge";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";

/** Platform settings links — admin surface only (licensee app has no Platform tab). */
function adminHref(path: string): string {
  return `${ADMIN_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

const PLATFORM_AREAS: {
  href: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  summary?: string;
  devOnly?: boolean;
}[] = [
  {
    href: adminHref("/settings/gateway"),
    title: "Integration Routing",
    description: "Channel and gateway routing configuration for inbound and outbound capabilities.",
    actionLabel: "Manage routing",
    icon: Route,
    summary: "Inbound/outbound capability paths",
  },
  {
    href: adminHref("/settings/traces"),
    title: "Automation traces",
    description: "Raw trace stream for operator debugging — not for licensee self-service.",
    actionLabel: "View traces",
    icon: ScrollText,
    summary: "Cross-tenant automation trace stream",
  },
  {
    href: adminHref("/settings/linkguard"),
    title: "LiNKguard",
    description: "Automated cleanup worker health and recent activity from the LiNKguard sidecar.",
    actionLabel: "Manage LiNKguard",
    icon: Trash2,
    summary: "Worker residue cleanup and audit events",
  },
  {
    href: adminHref("/devtools/mvo-proof"),
    title: "MVO Proof Surfaces",
    description: "Deterministic WebsiteFactory, LEXOS, and LiNKapps proof snapshots for UI testing during MVO build-out.",
    actionLabel: "View proof surfaces",
    icon: FlaskConical,
    summary: "Fixture-only demo snapshots",
    devOnly: true,
  },
];

export function SettingsPlatformPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PLATFORM_AREAS.map((item) => (
        <SettingCard
          key={item.href}
          icon={item.icon}
          title={item.title}
          description={item.description}
          actionLabel={item.actionLabel}
          href={item.href}
          titleAction={item.devOnly ? <StubBadge label="Development only" /> : undefined}
        >
          {item.summary ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.summary}</p> : null}
        </SettingCard>
      ))}
    </div>
  );
}
