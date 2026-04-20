"use client";

import Link from "next/link";

import { parseProjectTab, type ProjectTabId } from "@/lib/project-tabs";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

export { parseProjectTab, type ProjectTabId } from "@/lib/project-tabs";

const PROJECT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "work-items", label: "Work items" },
  { id: "cycles", label: "Cycles" },
  { id: "agents", label: "LiNKbots" },
  { id: "tools", label: "Tool permissions" },
  { id: "activity", label: "Activity" },
] as const;

export function ProjectDetailTabNav(props: { missionId: string; tab: ProjectTabId }) {
  const { missionId: id } = props;

  return (
    <nav className={`${TABS.row} mb-8`} aria-label="Project sections">
      {PROJECT_TABS.map((t) => {
        const active = props.tab === t.id;
        const href = t.id === "overview" ? `/projects/${id}` : `/projects/${id}?tab=${t.id}`;
        return (
          <Link key={t.id} href={href} className={screenTabLinkClass(active)}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
