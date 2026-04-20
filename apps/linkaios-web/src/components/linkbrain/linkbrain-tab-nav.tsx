"use client";

import Link from "next/link";

import { memoryHref } from "@/lib/memory-href";
import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

const TABS_LIST: { id: LinkbrainTab; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "project", label: "Project" },
  { id: "agent", label: "LiNKbot" },
  { id: "company", label: "Company" },
  { id: "ask", label: "Ask LiNKbrain" },
];

export function LinkbrainTabNav(props: {
  active: LinkbrainTab;
  mission?: string;
  classification?: string;
  agent?: string;
  scope?: "recent" | "all";
  brainScope?: string;
  brainMission?: string;
  brainAgent?: string;
  orgNode?: string;
}) {
  const q = {
    mission: props.mission,
    classification: props.classification,
    agent: props.agent,
    scope: props.scope,
    brainScope: props.brainScope,
    brainMission: props.brainMission,
    brainAgent: props.brainAgent,
    org: props.orgNode,
  };

  return (
    <nav className={TABS.row} aria-label="LiNKbrain sections">
      {TABS_LIST.map((t) => (
        <Link key={t.id} href={memoryHref(t.id, q)} className={screenTabLinkClass(props.active === t.id)}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
