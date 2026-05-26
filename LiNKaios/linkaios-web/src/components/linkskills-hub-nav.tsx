"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LINKSKILLS_HUB_TABS, resolveLinkskillsHubTab } from "@/lib/linkskills-hub-tabs";
import { screenTabLinkClass, TABS as SCREEN_TABS } from "@/lib/ui-standards";

export function LinkskillsHubNav() {
  const pathname = usePathname() ?? "/skills";
  const current = resolveLinkskillsHubTab(pathname);

  return (
    <nav aria-label="LiNKskills sections" className={SCREEN_TABS.row}>
      {LINKSKILLS_HUB_TABS.map((tab) => {
        const on = current === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={screenTabLinkClass(on)}
            role="tab"
            aria-selected={on}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
