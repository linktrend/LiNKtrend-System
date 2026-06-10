"use client";

import Link from "next/link";

import { parseProjectTab, PROJECT_TAB_DEFS, type ProjectTabId } from "@/lib/project-tabs";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

export { parseProjectTab, type ProjectTabId } from "@/lib/project-tabs";

export function ProjectDetailTabNav(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
  tab: ProjectTabId;
  /** Route prefix before `/{id}` — default Client `/projects`. */
  basePath?: string;
}) {
  const id = resolveProjectIdFromProps(props);
  const base = props.basePath ?? "/projects";

  return (
    <nav className={`${TABS.row} mb-8`} aria-label="Project sections">
      {PROJECT_TAB_DEFS.map((t) => {
        const active = props.tab === t.id;
        const href = t.id === "overview" ? `${base}/${id}` : `${base}/${id}?tab=${t.id}`;
        return (
          <Link key={t.id} href={href} className={screenTabLinkClass(active)}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
