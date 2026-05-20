"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { linkbotNativeUiHref } from "@/lib/linkbot-native-ui";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

type Tab = { href: (id: string) => string; label: string; match: (path: string, id: string) => boolean };

const CORE: Tab[] = [
  {
    href: (id) => `/workers/${id}/sessions`,
    label: "Sessions",
    match: (path, id) => path === `/workers/${id}/sessions` || path === `/workers/${id}` || path.startsWith(`/workers/${id}/sessions/`),
  },
  {
    href: (id) => `/workers/${id}/projects`,
    label: "Projects",
    match: (path, id) => path.startsWith(`/workers/${id}/projects`),
  },
];

const CAPABILITIES: Tab[] = [
  {
    href: (id) => `/workers/${id}/skills`,
    label: "LiNKskills",
    match: (path, id) => path.startsWith(`/workers/${id}/skills`),
  },
  {
    href: (id) => `/workers/${id}/models`,
    label: "Models",
    match: (path, id) => path.startsWith(`/workers/${id}/models`),
  },
];

const KNOWLEDGE: Tab[] = [
  {
    href: (id) => `/workers/${id}/brain`,
    label: "LiNKbrain",
    match: (path, id) => path.startsWith(`/workers/${id}/brain`),
  },
];

const CONFIG: Tab[] = [
  {
    href: (id) => `/workers/${id}/settings`,
    label: "Settings",
    match: (path, id) => path.startsWith(`/workers/${id}/settings`),
  },
];

const ALL_TABS: Tab[] = [...CORE, ...CAPABILITIES, ...KNOWLEDGE, ...CONFIG];

export function WorkerSubnav(props: { agentId: string }) {
  const pathname = usePathname() ?? "";
  const { agentId } = props;
  const openclaw = linkbotNativeUiHref(agentId);

  return (
    <nav aria-label="LiNKbot sections" className="mt-6">
      <div className={TABS.row} role="tablist">
        {ALL_TABS.map((tab) => {
          const href = tab.href(agentId);
          const active = tab.match(pathname, agentId);
          return (
            <Link key={tab.label} href={href} className={screenTabLinkClass(active)} role="tab" aria-selected={active}>
              {tab.label}
            </Link>
          );
        })}
        <a
          href={openclaw}
          target="_blank"
          rel="noopener noreferrer"
          className={screenTabLinkClass(false)}
          title="Opens the native LiNKbot UI in a new tab when configured"
        >
          Native UI
        </a>
      </div>
    </nav>
  );
}
