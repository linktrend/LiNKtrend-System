"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppSurface } from "@/components/app-surface-provider";
import { WORKER_DETAIL_TABS, type WorkerDetailTabId } from "@/lib/worker-detail-tabs";
import { openExternalPopup } from "@/lib/zulip-links";
import { screenTabLinkClass } from "@/lib/ui-standards";

export function WorkerSubnav(props: {
  agentId: string;
  visibleTabIds?: ReadonlySet<WorkerDetailTabId>;
  nativeUiHref?: string;
}) {
  const pathname = usePathname() ?? "";
  const { href: appHref, routePath } = useAppSurface();
  const route = routePath(pathname);
  const { agentId, visibleTabIds, nativeUiHref } = props;
  const tabs = visibleTabIds
    ? WORKER_DETAIL_TABS.filter((tab) => visibleTabIds.has(tab.id))
    : WORKER_DETAIL_TABS;

  return (
    <nav aria-label="LiNKbot sections" className="sticky top-0 z-10 -mx-1 bg-zinc-50/95 py-1 backdrop-blur dark:bg-zinc-950/90">
      <div className="min-w-0 overflow-x-auto pb-px [-webkit-overflow-scrolling:touch]">
        <div className="flex w-max min-w-full flex-nowrap items-end gap-1 border-b border-zinc-200 dark:border-zinc-800 md:w-auto md:min-w-0">
          {tabs.map((tab) => {
            if (tab.id === "native-ui") {
              const external = nativeUiHref?.startsWith("http") ?? false;
              const active = tab.match(route, agentId);
              return (
                <button
                  key={tab.label}
                  type="button"
                  className={screenTabLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    if (external && nativeUiHref) {
                      openExternalPopup(nativeUiHref);
                      return;
                    }
                    window.location.href = appHref(tab.href(agentId));
                  }}
                >
                  {tab.label}
                </button>
              );
            }

            const href = appHref(tab.href(agentId));
            const active = tab.match(route, agentId);
            return (
              <Link key={tab.label} href={href} prefetch={false} className={screenTabLinkClass(active)} aria-current={active ? "page" : undefined}>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function WorkerTabContent(props: { children: React.ReactNode }) {
  return <div className="min-w-0">{props.children}</div>;
}
