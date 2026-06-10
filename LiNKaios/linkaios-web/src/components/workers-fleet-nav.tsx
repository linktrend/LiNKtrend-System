"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAppSurface } from "@/components/app-surface-provider";
import { isPlatformAllScope } from "@/lib/app-roles";
import { LICENSOR_SCOPE_PARAM, normalizeLicensorScope } from "@/lib/licensor-view-scope";
import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

const VIEWS = ["list", "grid", "org"] as const;
export type FleetView = (typeof VIEWS)[number];

const LABELS: Record<FleetView, string> = {
  list: "List",
  grid: "Grid",
  org: "Org",
};

function workersHref(
  appHref: (path: string) => string,
  searchParams: URLSearchParams,
  overrides: { view?: FleetView; filter?: FleetPresenceFilter | null },
): string {
  const scope = normalizeLicensorScope(searchParams.get(LICENSOR_SCOPE_PARAM));
  const params = new URLSearchParams();
  if (!isPlatformAllScope(scope)) params.set(LICENSOR_SCOPE_PARAM, scope);
  const view = overrides.view ?? parseFleetView(searchParams.get("view") ?? undefined);
  if (view !== "list") params.set("view", view);
  const filter = overrides.filter === null ? null : (overrides.filter ?? searchParams.get("filter"));
  if (filter && filter !== "all") params.set("filter", filter);
  const qs = params.toString();
  return appHref(qs ? `/workers?${qs}` : "/workers");
}

export function WorkersFleetNav(props: { current: FleetView }) {
  const { href: appHref } = useAppSurface();
  const searchParams = useSearchParams();
  return (
    <nav aria-label="LiNKbots views" className={`${TABS.row} mt-6`}>
      {VIEWS.map((v) => {
        const active = props.current === v;
        const href = workersHref(appHref, searchParams, { view: v === "list" ? "list" : v });
        return (
          <Link key={v} href={href} className={screenTabLinkClass(active)}>
            {LABELS[v]}
          </Link>
        );
      })}
    </nav>
  );
}

export function parseFleetView(raw: string | string[] | undefined): FleetView {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "grid" || v === "org") return v;
  return "list";
}

/** @deprecated Sidebar View filter replaces URL `scope=admin`. */
export type WorkersFleetScope = "all" | "admin";

/** @deprecated Use {@link parseLicensorScopeParam} from licensor-view-scope. */
export function parseWorkersFleetScope(raw: string | string[] | undefined): WorkersFleetScope {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  return v === "admin" ? "admin" : "all";
}

/** @deprecated Sidebar View syncs scope via {@link LICENSOR_SCOPE_PARAM}. */
export function workersFleetScopeQuery(_scope: WorkersFleetScope): string {
  return "";
}

export type FleetPresenceFilter = "all" | "active" | "inactive" | "online" | "busy" | "idle";

export function parseFleetPresenceFilter(raw: string | string[] | undefined): FleetPresenceFilter {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  if (v === "active" || v === "inactive" || v === "online" || v === "busy" || v === "idle") return v;
  return "all";
}

const pill = "inline-flex min-w-[6.5rem] shrink-0 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition";

export function FleetPresenceFilterBar(props: {
  current: FleetPresenceFilter;
  view: FleetView;
}) {
  const { href: appHref } = useAppSurface();
  const searchParams = useSearchParams();
  const items: { id: FleetPresenceFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "online", label: "Online" },
    { id: "busy", label: "Busy" },
    { id: "idle", label: "Idle" },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = props.current === it.id;
        const href =
          it.id === "all"
            ? workersHref(appHref, searchParams, { view: props.view, filter: null })
            : workersHref(appHref, searchParams, { view: props.view, filter: it.id });
        return (
          <Link
            key={it.id}
            href={href}
            className={
              pill +
              (active
                ? " bg-zinc-900 text-white ring-1 ring-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-100"
                : " bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300 hover:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600 dark:hover:ring-zinc-500")
            }
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
