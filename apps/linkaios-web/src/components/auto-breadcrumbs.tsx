"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useBreadcrumbLabels } from "@/components/breadcrumb-label-registry";

const STATIC_LABELS: Record<string, string> = {
  work: "Work",
  alerts: "Alerts",
  messages: "Messages",
  sessions: "Sessions",
  workers: "LiNKbots",
  missions: "Projects",
  projects: "Projects",
  skills: "LiNKskills",
  tools: "Tool permissions",
  brain: "LiNKbrain",
  models: "Models",
  memory: "LiNKbrain",
  metrics: "Metrics",
  company: "Company",
  gateway: "Integration routing",
  settings: "Settings",
  user: "User",
  access: "Access",
  traces: "System logs",
  governance: "Governance",
  devtools: "Devtools",
  admin: "Admin",
  login: "Login",
};

const DEMO_AGENT_LABEL: Record<string, string> = {
  "demo-lisa": "Lisa (CEO)",
  "demo-eric": "Eric (CTO)",
};

const DEMO_MISSION_LABEL: Record<string, string> = {
  "demo-smb": "SMB Website Builder",
  "demo-ai-edu": "Ai Edu Channel",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function segmentLabel(seg: string, fixtureLabelsInNav: boolean, uuidLabels: Record<string, string>): string {
  if (fixtureLabelsInNav) {
    if (DEMO_AGENT_LABEL[seg]) return DEMO_AGENT_LABEL[seg];
    if (DEMO_MISSION_LABEL[seg]) return DEMO_MISSION_LABEL[seg];
  }
  if (STATIC_LABELS[seg]) return STATIC_LABELS[seg];
  if (UUID_RE.test(seg) && uuidLabels[seg]) return uuidLabels[seg]!;
  if (UUID_RE.test(seg)) return `…${seg.slice(0, 8)}`;
  return seg;
}

export function AutoBreadcrumbs(props: { fixtureLabelsInNav?: boolean }) {
  const fixtureLabelsInNav = Boolean(props.fixtureLabelsInNav);
  const pathname = usePathname() ?? "/";
  const uuidLabels = useBreadcrumbLabels();
  const parts = pathname.split("/").filter(Boolean);

  const items: { href?: string; label: string }[] = [];

  if (pathname === "/") {
    items.push({ href: "/", label: "LiNKaios" }, { label: "Overview" });
  } else {
    items.push({ href: "/", label: "LiNKaios" });
    let acc = "";
    for (const seg of parts) {
      acc += `/${seg}`;
      items.push({ href: acc, label: segmentLabel(seg, fixtureLabelsInNav, uuidLabels) });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-left text-sm text-zinc-500 dark:text-zinc-400">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.href ?? "cur"}-${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>/</span> : null}
              {last || !item.href ? (
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-zinc-500 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
