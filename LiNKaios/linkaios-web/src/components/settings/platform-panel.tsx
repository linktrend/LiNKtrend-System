import { Route, ScrollText, Trash2, type LucideIcon } from "lucide-react";

import { SettingCard } from "@/components/settings/setting-card";
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
}[] = [
  {
    href: adminHref("/settings/gateway"),
    title: "Zulip stream routing",
    description:
      "See which Zulip chat streams are linked to which LiNKaios projects — use this when messages land in the wrong place or a project stream is missing.",
    actionLabel: "View stream routing",
    icon: Route,
    summary: "Zulip stream ↔ project links and recent message routing",
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
        >
          {item.summary ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.summary}</p> : null}
        </SettingCard>
      ))}
    </div>
  );
}
