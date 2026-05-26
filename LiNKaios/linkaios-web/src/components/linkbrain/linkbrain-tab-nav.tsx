"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAppRole } from "@/components/role-preview-provider";
import { canAccessLinkbrainTab, visibleLinkbrainTabs } from "@/lib/app-roles";
import { useMemoryHref } from "@/hooks/use-memory-href";
import { linkbrainTabLabel } from "@/lib/linkbrain-page-copy";
import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { LINKBRAIN_NAV_TABS } from "@/lib/memory-nav";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

export function LinkbrainRestrictedTabRedirect(props: { active: LinkbrainTab }) {
  const { kind, role } = useAppRole();
  const router = useRouter();
  const hrefForTab = useMemoryHref();

  useEffect(() => {
    if (!canAccessLinkbrainTab(kind, role, props.active)) {
      router.replace(hrefForTab("inbox"), { scroll: false });
    }
  }, [kind, role, props.active, router, hrefForTab]);

  return null;
}

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
  cIndustry?: string;
  cPattern?: string;
  cUseCase?: string;
  cSubmission?: string;
}) {
  const { kind, role } = useAppRole();
  const hrefForTab = useMemoryHref();
  const allowed = new Set<LinkbrainTab>(visibleLinkbrainTabs(kind, role));
  const tabs = LINKBRAIN_NAV_TABS.filter((t) => allowed.has(t.id));

  const q = {
    mission: props.mission,
    classification: props.classification,
    agent: props.agent,
    scope: props.scope,
    brainScope: props.brainScope,
    brainMission: props.brainMission,
    brainAgent: props.brainAgent,
    org: props.orgNode,
    cIndustry: props.cIndustry,
    cPattern: props.cPattern,
    cUseCase: props.cUseCase,
    cSubmission: props.cSubmission,
  };

  return (
    <nav className={TABS.row} aria-label="LiNKbrain sections">
      {tabs.map((t) => (
        <Link key={t.id} href={hrefForTab(t.id, q)} className={screenTabLinkClass(props.active === t.id)}>
          {linkbrainTabLabel(t.id, kind)}
        </Link>
      ))}
    </nav>
  );
}
